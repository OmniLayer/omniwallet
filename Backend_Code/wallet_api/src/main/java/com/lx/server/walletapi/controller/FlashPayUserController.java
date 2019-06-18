package com.lx.server.walletapi.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lx.server.bean.ResultTO;
import com.lx.server.service.FpUserService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("api/fp/user")
@Api(tags = {"fp快速支付用户接口"})
public class FlashPayUserController extends AbstractController {
	
	@Autowired
	private FpUserService userService;
	
	@SuppressWarnings("serial")
	@GetMapping("check")
	@ApiOperation("检测email是否已经存在")
	public ResultTO check(String email) {
		Assert.isTrue(Tools.checkEmail(email), "error email");
		
		int count = userService.pageCount(new HashMap<String,Object>() {{
			put("userId", getUserId());
		}});
		
		Assert.isTrue(count==0, "user's flash account have been exist");
		count = userService.pageCount(new HashMap<String,Object>() {{
			put("hyperUsername", email);
		}});
		
		Assert.isTrue(count==0, "email is exist, try another email");
		
		return ResultTO.newSuccessResult("can create");
	}
	
	
	@SuppressWarnings("serial")
	@PostMapping("create")
	@ApiOperation("创建用户")
	public ResultTO create(String email) throws Exception {
		Assert.isTrue(Tools.checkEmail(email), "error email");
		
		int count = userService.pageCount(new HashMap<String,Object>() {{
			put("userId", getUserId());
			
		}});
		
		Assert.isTrue(count==0, "user's flash account have been exist");
		
		
		count = userService.pageCount(new HashMap<String,Object>() {{
			put("hyperUsername", email);
		}});
		
		Assert.isTrue(count==0, "email is exist, try another email");
		
		
		Map<String, Object> res = userService.create(getUserId(),email);
		if(res!=null)
		{
			return ResultTO.newSuccessResult(res);
		}
		return ResultTO.newFailResult("create fail");
	}

}
