package com.swarainstitute.app;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import org.json.JSONArray;
import org.json.JSONObject;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

final class SecureStore {
    private final Context context;
    private static final String ALIAS="swara-data-v1";
    SecureStore(Context c){context=c.getApplicationContext();}
    boolean exists(){return new File(context.getFilesDir(),"institute.bin").exists()||new File(context.getFilesDir(),"institute.bin.bak").exists();}
    private SecretKey key() throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
        if(!ks.containsAlias(ALIAS)){
            KeyGenerator kg=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            kg.init(new KeyGenParameterSpec.Builder(ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build());kg.generateKey();
        }
        return (SecretKey)ks.getKey(ALIAS,null);
    }
    synchronized JSONObject read() throws Exception {
        byte[] bytes=new AtomicFile(new File(context.getFilesDir(),"institute.bin")).readFully();
        if(bytes.length<28)throw new IOException("Storage file is invalid.");
        Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,java.util.Arrays.copyOfRange(bytes,0,12)));
        return new JSONObject(new String(c.doFinal(java.util.Arrays.copyOfRange(bytes,12,bytes.length)),StandardCharsets.UTF_8));
    }
    synchronized void write(JSONObject root) throws Exception {
        Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());byte[] encrypted=c.doFinal(root.toString().getBytes(StandardCharsets.UTF_8));
        AtomicFile f=new AtomicFile(new File(context.getFilesDir(),"institute.bin"));FileOutputStream out=null;
        try{out=f.startWrite();out.write(c.getIV());out.write(encrypted);f.finishWrite(out);}catch(Exception e){if(out!=null)f.failWrite(out);throw e;}
    }
    static byte[] random(int n){byte[] b=new byte[n];new SecureRandom().nextBytes(b);return b;}
    static byte[] derive(String password,byte[] salt,int rounds)throws Exception{PBEKeySpec spec=new PBEKeySpec(password.toCharArray(),salt,rounds,256);try{return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();}finally{spec.clearPassword();}}
    static JSONObject account(String name,String pin,String role,String entity)throws Exception{
        if(!name.matches("[a-zA-Z0-9._-]{3,40}"))throw new IllegalArgumentException("Username must be 3–40 letters, digits, dots, underscores or hyphens.");
        if(!pin.matches("[0-9]{6,12}"))throw new IllegalArgumentException("PIN must have 6–12 digits.");
        byte[] salt=random(16);return new JSONObject().put("username",name.toLowerCase(java.util.Locale.ROOT)).put("role",role).put("entityId",entity).put("salt",Base64.getEncoder().encodeToString(salt)).put("hash",Base64.getEncoder().encodeToString(derive(pin,salt,120000)));
    }
    static boolean verify(JSONObject user,String pin)throws Exception{return MessageDigest.isEqual(Base64.getDecoder().decode(user.getString("hash")),derive(pin,Base64.getDecoder().decode(user.getString("salt")),120000));}
    static String backup(JSONObject root,String password)throws Exception{
        if(password.length()<10)throw new IllegalArgumentException("Backup password must have at least 10 characters.");
        byte[] salt=random(16);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(derive(password,salt,210000),"AES"));
        byte[] encrypted=c.doFinal(root.toString().getBytes(StandardCharsets.UTF_8));
        return new JSONObject().put("format","swara-encrypted-backup-v1").put("iterations",210000).put("salt",Base64.getEncoder().encodeToString(salt)).put("iv",Base64.getEncoder().encodeToString(c.getIV())).put("data",Base64.getEncoder().encodeToString(encrypted)).toString(2);
    }
    static JSONObject restore(String text,String password)throws Exception{
        JSONObject b=new JSONObject(text);if(!b.optString("format").equals("swara-encrypted-backup-v1")||b.optInt("iterations")!=210000)throw new IllegalArgumentException("This is not a supported Swara backup.");
        Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(derive(password,Base64.getDecoder().decode(b.getString("salt")),210000),"AES"),new GCMParameterSpec(128,Base64.getDecoder().decode(b.getString("iv"))));
        JSONObject root=new JSONObject(new String(c.doFinal(Base64.getDecoder().decode(b.getString("data"))),StandardCharsets.UTF_8));
        Database.validate(root.getJSONObject("state"));JSONArray users=root.getJSONArray("accounts");boolean owner=false;java.util.HashSet<String> names=new java.util.HashSet<>();
        for(int i=0;i<users.length();i++){JSONObject u=users.getJSONObject(i);if(!names.add(u.getString("username")))throw new IllegalArgumentException("Duplicate backup accounts.");if(u.getString("role").equals("Owner"))owner=true;else Database.validateAccount(root.getJSONObject("state"),u.getString("role"),u.optString("entityId"));if(Base64.getDecoder().decode(u.getString("salt")).length!=16||Base64.getDecoder().decode(u.getString("hash")).length!=32)throw new IllegalArgumentException("Invalid account data.");}
        if(!owner)throw new IllegalArgumentException("Backup has no owner account.");return root;
    }
}
