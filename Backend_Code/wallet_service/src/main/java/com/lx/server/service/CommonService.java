package com.lx.server.service;

import java.math.BigDecimal;
import java.util.Map;

import com.alibaba.fastjson.JSONObject;

public interface CommonService {

	BigDecimal getCoinExchangeRate(String coinName,String unit);

	BigDecimal getExchangeRateBaseEUR(String type);

	Map<String, Object> getTransactionsByAddress(String address) throws Exception;

	Map<String, Object> getOmniTransactions(String address, Integer assetId) throws Exception;

	JSONObject getRateFromBlockChain();

	Integer getNewestAddressIndex(String userId);
}
