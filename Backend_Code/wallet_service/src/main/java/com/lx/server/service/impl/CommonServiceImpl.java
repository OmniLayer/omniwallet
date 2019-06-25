package com.lx.server.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.lx.server.dao.CommonDao;
import com.lx.server.service.CommonService;
import com.lx.server.service.WalletService;

@Service(value = "commonService")
public class CommonServiceImpl implements CommonService{

	@Autowired
	private WalletService walletServcie;
	
	@Autowired
	private CommonDao commonDao;
	
	private final Log logger = LogFactory.getLog(getClass());
	/**
	 * 获取btc和美元的汇率
	 * @return
	 */
	@Override
	public BigDecimal getCoinExchangeRate(String coinName,String unit) {
		JSONObject item = this.getResponseFormJinSe(coinName,unit);
		if (item!=null) {
			return new BigDecimal(item.getString("last"));
		}
		return null;
	}
	
	@Override
	public JSONObject getRateFromBlockChain() {
		String url = "https://blockchain.info/ticker";
		RestTemplate client = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<MultiValueMap<String, String>>(null,headers);
		ResponseEntity<String> response = client.exchange(url, HttpMethod.GET, requestEntity, String.class);
		if (response!=null) {
			return JSON.parseObject(response.getBody()); 
		}
		return null;
	}
	
	
	
//	{"date":"1546853359","ticker":{"high":"4074.32","vol":"287.6153","last":"4006.97","low":"3790.83","buy":"4000.99","sell":"4007.45"}}
//	https://github.com/jinsecaijing/api_wiki/wiki/%E8%A1%8C%E6%83%85%E6%8E%A5%E5%8F%A3  行情接口
	private JSONObject getResponseFormJinSe(String coinName,String unit) {
		if (unit==null) {
			unit = "usd";
		}
		String url = "http://market.jinse.com/api/v1/tick/BITFINEX:"+coinName+"usd?unit="+unit;
		logger.info("url "+url);
		if (coinName.startsWith("usdt")) {
			url = "http://market.jinse.com/api/v1/tick/BITTREX:"+coinName+"usd?unit="+unit;
		}
		RestTemplate client = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<MultiValueMap<String, String>>(null,headers);
		ResponseEntity<String> response = null;
		try {
			response = client.exchange(url, HttpMethod.GET, requestEntity, String.class);
			if (response!=null) {
				JSONObject jsonObject = JSONObject.parseObject(response.getBody());
				if (jsonObject.containsKey("close")&&jsonObject.getBigDecimal("close")!=null) {
					jsonObject.put("last", jsonObject.getBigDecimal("close"));
					return jsonObject;
				}
			}
		} catch (Exception e) {
			url = "https://www.okcoin.com/api/v1/ticker.do?symbol="+coinName+"_usd";
			response = client.exchange(url, HttpMethod.GET, requestEntity, String.class);
			if (response!=null) {
				JSONObject jsonObject = JSONObject.parseObject(response.getBody());
				if (jsonObject.containsKey("ticker")&&jsonObject.getJSONObject("ticker")!=null) {
					return jsonObject.getJSONObject("ticker");
				}
			}
		}
		
		return null;
	}
	
	
	
	
	@Override
	public BigDecimal getExchangeRateBaseEUR(String type) {
		String url = "http://webforex.hermes.hexun.com/forex/quotelist?code=FOREXEURUSD&column=Code,Price";
		RestTemplate client = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<MultiValueMap<String, String>>(null,headers);
		ResponseEntity<String> response = client.exchange(url, HttpMethod.GET, requestEntity, String.class);
		String data = response.getBody();
		data = data.substring(1, data.length()-2);
		JSONObject jsonObject = JSONObject.parseObject(data);
		if (jsonObject!=null) {
			BigDecimal ex = jsonObject.getJSONArray("Data").getJSONArray(0).getJSONArray(0).getBigDecimal(1);
			return ex.divide(new BigDecimal(10000));
		}else {
			url = "https://api.exchangeratesapi.io/latest";
			jsonObject = JSONObject.parseObject(response.getBody());
			if (jsonObject!=null&&jsonObject.containsKey("rates")&&jsonObject.getJSONObject("rates")!=null) {
				return jsonObject.getJSONObject("rates").getBigDecimal(type);
			}
		}
		return null;
	}
	
	private BigDecimal divider = new BigDecimal("100000000");

	@Override
	public Map<String, Object> getTransactionsByAddress(String address) throws Exception {
//		14rihN27NqVTtBfQVq6KrccQSWeWGKK46H
		String url = "https://blockchain.info/address/"+address+"?format=json";
		RestTemplate client = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<MultiValueMap<String, String>>(null,headers);
		ResponseEntity<String> response = client.exchange(url, HttpMethod.GET, requestEntity, String.class);
		String data = response.getBody();
		JSONObject dataJson = JSONObject.parseObject(data);
		JSONArray dataArray = dataJson.getJSONArray("txs");
		
		Map<String, Object> retData = new HashMap<>();
		
		retData.put("txCount", dataJson.getInteger("n_tx"));
		retData.put("finalBalance", dataJson.getBigDecimal("final_balance").divide(divider));
		retData.put("totalSent", dataJson.getBigDecimal("total_sent").divide(divider));
		retData.put("totalReceived", dataJson.getBigDecimal("total_received").divide(divider));
		List<Object> list = new ArrayList<>();
		for(int i = 0;i<dataArray.size();i++) 
		{
			Map<String, Object> node = new HashMap<>();
			JSONObject jsonObject = dataArray.getJSONObject(i);
			String txId = jsonObject.getString("hash");
			Object transObj = walletServcie.getBtcTransaction(txId);
			Integer confirmAmount = 0;
			if (transObj != null) {
				Map<String, Object> transaction = (Map<String, Object>) transObj;
				confirmAmount = (Integer) transaction.get("confirmations");
			}
			node.put("time", jsonObject.getDate("time"));
			node.put("txId", txId);
			node.put("result", jsonObject.getInteger("result"));
			node.put("confirmAmount",confirmAmount);
			node.put("blockHeight", jsonObject.get("block_height"));
			boolean isSend = this.checkAddressIsSend(jsonObject, address);
			node.put("isSend", isSend);
			if (isSend) {
				Map<String, Object> outMap = this.getOutAddress(jsonObject, address);
				if (outMap!=null) {
					node.put("targetAddress",outMap.get("addr") );
					node.put("txValue",outMap.get("value") );
				}
			}else {
				node.put("targetAddress",getInputAddress(jsonObject, address));
				node.put("txValue",getInputAcount(jsonObject, address));
			}
			list.add(node);
		}
		retData.put("list", list);
		return retData;
	}
	private boolean checkAddressIsSend(JSONObject jsonObject,String address) {
		JSONArray inputs = jsonObject.getJSONArray("inputs");
		for(int i=0;i<inputs.size();i++) {
			JSONObject item = inputs.getJSONObject(i).getJSONObject("prev_out");
			if (item.containsKey("addr")&&item.getString("addr").equals(address)) {
				return true;
			}
		}
		return false;
	}
	private String getInputAddress(JSONObject jsonObject,String address) {
		JSONArray inputs = jsonObject.getJSONArray("inputs");
		for(int i=0;i<inputs.size();i++) {
			JSONObject item = inputs.getJSONObject(i).getJSONObject("prev_out");
			if (item.containsKey("addr")&&item.getString("addr").equals(address)==false) {
				return item.getString("addr");
			}
		}
		return "";
	}
	private BigDecimal getInputAcount(JSONObject jsonObject,String address) {
		JSONArray outs = jsonObject.getJSONArray("out");
		for(int i=0;i<outs.size();i++) {
			JSONObject item = outs.getJSONObject(i);
			if (item.containsKey("addr")&&item.getString("addr").equals(address)) {
				Map<String, Object> node = new HashMap<>();
				node.put("addr", item.getString("addr"));
				node.put("value", item.getBigDecimal("value").divide(this.divider));
				return item.getBigDecimal("value").divide(this.divider);
			}
		}
		return BigDecimal.ZERO;
	}
	
	private Map<String, Object> getOutAddress(JSONObject jsonObject,String address) {
		JSONArray outs = jsonObject.getJSONArray("out");
		for(int i=0;i<outs.size();i++) {
			JSONObject item = outs.getJSONObject(i);
			if (item.containsKey("addr")&&item.getString("addr").equals(address)==false) {
				Map<String, Object> node = new HashMap<>();
				node.put("addr", item.getString("addr"));
				node.put("value", item.getBigDecimal("value").divide(this.divider));
				return node;
			}
		}
		return null;
	}

	@Override
	public Map<String, Object> getOmniTransactions(String address, Integer assetId) throws Exception {
		List<Map<String, Object>> omniData = walletServcie.getOmniTransactions(address);
		List<Map<String, Object>> omniPendingData = walletServcie.getOmniPendingTransactions(address);
		List<Map<String, Object>> datas = new ArrayList<>();
		if (omniPendingData!=null) {
			for (Map<String, Object> map : omniPendingData) {
				Integer propertyid = (Integer) map.get("propertyid");
				if (propertyid.compareTo(assetId)==0) {
					datas.add(0,map);
				}
			}
		}
		
		if (omniData!=null) {
			for (Map<String, Object> map : omniData) {
				Integer propertyid = (Integer) map.get("propertyid");
				if (propertyid.compareTo(assetId)==0) {
					datas.add(map);
				}
			}
		}
		
		
		Map<String, Object> retData = new HashMap<>();
		
		retData.put("txCount", datas.size());
		List<Object> list = new ArrayList<>();
		for(int i = 0;i<datas.size();i++) 
		{
			Map<String, Object> dateNode = datas.get(i);
			Map<String, Object> node = new HashMap<>();
			node.put("time", dateNode.get("blocktime"));
			node.put("txId", dateNode.get("txid"));
			node.put("result", dateNode.get("amount"));
			node.put("confirmAmount",dateNode.get("confirmations"));
			node.put("blockHeight", dateNode.get("block")!=null?dateNode.get("block"):0);
			String sendingaddress = (String) dateNode.get("sendingaddress");
			String referenceaddress = (String) dateNode.get("referenceaddress");
			boolean isSend = false;
			if (sendingaddress.equals(address)) {
				isSend =true;
				node.put("targetAddress",referenceaddress);
			}else {
				node.put("targetAddress",sendingaddress);
			}
			node.put("isSend", isSend);
			node.put("txValue",dateNode.get("amount"));
			list.add(node);
		}
		retData.put("list", list);
		return retData;
	}

	@Override
	public Integer getNewestAddressIndex(String userId) {
		Integer index = commonDao.getNewestAddressIndex(userId);
		if (index==null) {
			index = 0;
		}
		return index;
	}
	
}
