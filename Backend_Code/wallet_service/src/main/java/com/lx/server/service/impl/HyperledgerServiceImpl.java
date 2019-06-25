package com.lx.server.service.impl;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.lx.server.enums.EnumServerUrlHyperledger;
import com.lx.server.service.HyperledgerService;
import com.lx.server.utils.Tools;

@Service(value = "hyperledgerService")
public class HyperledgerServiceImpl implements HyperledgerService{

	private final Log logger = LogFactory.getLog(getClass());
	
	@Value("${url.base.hyperledger}")
    private String baseHyperledgerUrl;
    //请求房产的服务器
    private JSONObject httpRequestToHyber(EnumServerUrlHyperledger suburl,Map<String, Object> params) {
		CloseableHttpClient client =  HttpClients.createDefault();
		CloseableHttpResponse response = null;
		StringEntity entity=null;
		String url = baseHyperledgerUrl+suburl.value;
		HttpPost post = new HttpPost(url);
		logger.info(url);
		post.setHeader(new BasicHeader("Content-Type", "application/json; charset=utf-8"));
        post.setHeader(new BasicHeader("Accept", "text/plain;charset=utf-8"));
		
		try {
			entity = new StringEntity(JSON.toJSONString(params));
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}
        post.setEntity(entity);
        
        try {
			response = client.execute(post);
			String result = EntityUtils.toString(response.getEntity(),"UTF-8");
			logger.info(result);
			JSONObject jsonObject = JSONObject.parseObject(result);
			if (jsonObject!=null) {
				String errno = jsonObject.getString("errno");
				if (errno.equals("E0000")) {
					JSONObject payload = jsonObject.getJSONObject("payload");
					if (payload!=null) {
						if (payload.containsKey("Status")&&payload.getBooleanValue("Status")==false) {
							JSONObject node = new JSONObject();
							node.put("msg", payload.get("Message"));
							node.put("myError", true);
							return node;
						}
						return payload;
					}else {
						JSONObject node = new JSONObject();
						node.put("msg", "success");
						node.put("myError",false);
						return node;
					}
				}
				if (errno.equals("E0001")) {
					JSONObject node = new JSONObject();
					node.put("msg", jsonObject.get("errmsg"));
					node.put("myError", true);
					return node;
				}
			}
		} catch (IOException e) {
			logger.info("访问异常: "+e.getMessage());
			e.printStackTrace();
			
		}
        return null;
		
		
		
		
	}
	
	
	@Override
	public JSONObject getBaseAccount() {
		return this.httpRequestToHyber(EnumServerUrlHyperledger.baseAccount, null);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject createAccount(String username) {
		Assert.isTrue(Tools.checkStringExist(username), "账号为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
    		put("acc_name", username);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.createAccount, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject accountInfo(String username) {
		Assert.isTrue(Tools.checkStringExist(username), "账号为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("acc_name", username);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.accountInfo, params);
	}

	@SuppressWarnings("serial")
	@Override
	public JSONObject balances(String username) {
		Assert.isTrue(Tools.checkStringExist(username), "账号为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("acc_name", username);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.balances, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject mintToken(String tkSymbol, BigDecimal amount) {
		Assert.isTrue(Tools.checkStringExist(tkSymbol), "token标识为空");
		Assert.isTrue(amount.compareTo(BigDecimal.ZERO)>0, "转账金额必须大于零");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("tk_symbol", tkSymbol);
			put("amount", amount.toString());
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.mintToken, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject burnToken(String tkSymbol, BigDecimal amount) {
		Assert.isTrue(Tools.checkStringExist(tkSymbol), "token标识为空");
		Assert.isTrue(amount.compareTo(BigDecimal.ZERO)<0, "烧币金额必须大于零");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("tk_symbol", tkSymbol);
			put("amount", amount);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.burnToken, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject frozenAccount(String username) {
		Assert.isTrue(Tools.checkStringExist(username), "账号为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("acc_name", username);
			put("status", true);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.frozenAccount, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject unfrozenAccount(String username) {
		Assert.isTrue(Tools.checkStringExist(username), "账号为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("acc_name", username);
    		put("status", false);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.frozenAccount, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject transferToken(String from,String to,String symbol,BigDecimal amount) {
		Assert.isTrue(Tools.checkStringExist(from), "源头为空");
		Assert.isTrue(Tools.checkStringExist(to), "目标为空");
		Assert.isTrue(Tools.checkStringExist(symbol), "token标识为空");
		Assert.isTrue(amount.compareTo(BigDecimal.ZERO)>0, "转账金额必须大于零");
		Map<String, Object> params = new HashMap<String,Object>(){{
			put("from", from);
			put("to", to);
			put("symbol", symbol);
			put("amount", amount);
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.transferToken, params);
	}


	@SuppressWarnings("serial")
	@Override
	public JSONObject initToken(String tkSymbol) {
		Assert.isTrue(Tools.checkStringExist(tkSymbol), "token标识为空");
		Map<String, Object> params = new HashMap<String,Object>(){{
    		put("tk_symbol", tkSymbol);
    		put("name", tkSymbol);
    		put("supply", "0");
    	}};
		return this.httpRequestToHyber(EnumServerUrlHyperledger.initToken, params);
	}

}
