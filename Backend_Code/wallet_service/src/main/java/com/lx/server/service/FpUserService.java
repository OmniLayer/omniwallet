package com.lx.server.service;

import java.util.Map;

/**
 * 【flashPay 快速支付的用户】 服务类 接口
 *
 * @date 2019-06-14 10:53:56
 *
 */
public interface FpUserService extends MybatisBaseService {

	/**
	 * 创建用户
	 * @param userId
	 * @param email
	 * @return
	 * @throws Exception 
	 */
	Map<String, Object> create(String userId, String email) throws Exception;

}
