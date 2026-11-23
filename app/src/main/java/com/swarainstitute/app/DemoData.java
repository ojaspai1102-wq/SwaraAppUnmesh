package com.swarainstitute.app;
import org.json.*;
final class DemoData {
    static JSONObject remove(JSONObject existing)throws Exception{
        JSONObject out=Database.copy(existing);for(String key:Database.KEYS){JSONArray records=out.getJSONArray(key),keep=new JSONArray();for(int i=0;i<records.length();i++){JSONObject r=records.getJSONObject(i);if(!r.getString("id").startsWith("demo-"))keep.put(r);}out.put(key,keep);}out.put("demoData",false);Database.validate(out);return out;
    }
}
