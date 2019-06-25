package com.lx.server.service;

import javax.servlet.http.HttpServletRequest;

import com.lx.server.pojo.UserAdmin;

/**
 * 【用户表】 服务类 接口
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-14 00:09:20
 *
 */
public interface UserAdminService extends MybatisBaseService {
	
	Object login(String username, String password);

	String generateToken(UserAdmin user);

	String register(UserAdmin user, String code, HttpServletRequest request);

	Boolean changePsw(Integer userId, String psw);

}
