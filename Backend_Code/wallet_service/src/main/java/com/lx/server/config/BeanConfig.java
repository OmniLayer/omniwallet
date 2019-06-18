package com.lx.server.config;

import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.googlecode.jsonrpc4j.JsonRpcHttpClient;

@Configuration
public class BeanConfig {
	
    @Bean
    public JsonRpcHttpClient client() throws Throwable {
    	//获取操作系统的类型
    	String sysType = System.getProperties().getProperty("os.name");
    	String omniIp = "127.0.0.1";
    	if (sysType.toLowerCase().startsWith("win")) {
    		omniIp = "62.234.169.68";
		}
        // 身份认证
        String cred = Base64.encodeBase64String(("uprets" + ":" + "pass").getBytes());
        Map<String, String>  headers = new HashMap <>(1);
        headers.put("Authorization", "Basic " + cred);
        return new JsonRpcHttpClient(new URL("http://" + omniIp + ":" + "8332"), headers);
    }
}
