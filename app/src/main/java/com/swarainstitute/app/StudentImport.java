package com.swarainstitute.app;

import org.json.*;
import java.util.*;

final class StudentImport {
    static JSONObject merge(JSONObject existing,JSONObject payload)throws Exception{
        JSONObject out=Database.copy(existing);
        if(out.optInt("ramashreeStudentImportVersion",0)>=payload.getInt("version"))return out;
        Set<String> names=new HashSet<>();
        JSONArray current=out.getJSONArray("students");
        for(int i=0;i<current.length();i++)names.add(current.getJSONObject(i).optString("name").trim().toLowerCase(Locale.ROOT));
        JSONArray incoming=payload.getJSONArray("students");
        for(int i=0;i<incoming.length();i++){
            JSONObject student=Database.copy(incoming.getJSONObject(i));
            if(names.add(student.getString("name").trim().toLowerCase(Locale.ROOT)))current.put(student);
        }
        out.put("ramashreeStudentImportVersion",payload.getInt("version"));
        Database.validate(out);
        return out;
    }
}
