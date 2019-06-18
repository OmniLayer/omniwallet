package com.lx.server.dao;

public interface CommonDao {

	Integer getNewestAddressIndex(String userId);

	Integer getConfigParamValueByKey(String value);

}
