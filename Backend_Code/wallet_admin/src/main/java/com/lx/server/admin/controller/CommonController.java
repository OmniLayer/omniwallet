package com.lx.server.admin.controller;

import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.UserAdmin;
import com.lx.server.service.UserAdminService;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("admin/common")
@Api(tags = {"公共接口"})
public class CommonController {
	
	@Autowired
	private UserAdminService userService;
	
	@SuppressWarnings("serial")
	@PostMapping("register")
	@ApiOperation("设置密码并注册，返回token")
	@ApiImplicitParams({ 
			@ApiImplicitParam(name = "username", value = "用户名"),
			@ApiImplicitParam(name = "password", value = "密码,最多64位"),
			@ApiImplicitParam(name = "code", value = "6位数验证码 选填"),
			})
	public ResultTO register(String username, String password, String code, HttpServletRequest request) {
		Assert.hasLength(username, "帐号不能为空");
		String token = userService.register(new UserAdmin() {
			{
				setCreateTime(new Date());
				setUsername(username.trim());
				setPassword(password.trim());
				setIsEnable(true);
			}
		}, code, request);
		return ResultTO.newSuccessResult("ok", token);
	}
	
	
	@GetMapping("login")
 	@ApiOperation("登录")
	@ApiImplicitParams({ 
		@ApiImplicitParam(name = "username", value = "用户名"),
		@ApiImplicitParam(name = "password", value = "密码"),
		})
	public ResultTO login(String username,String password) {
 		Assert.hasLength(username, "用户名不能为空");
        Assert.isTrue(StringUtils.isEmpty(password)==false, "密码不能为空");
        return ResultTO.newSuccessResult("ok", userService.login(username, password));
 	}

}
