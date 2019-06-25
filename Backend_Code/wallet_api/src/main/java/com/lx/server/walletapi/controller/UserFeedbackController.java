package com.lx.server.walletapi.controller;

import java.util.Date;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lx.server.bean.Page;
import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.UserFeedback;
import com.lx.server.service.UserFeedbackService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("api/feedback")
@Api(tags = { "用户反馈"})
public class UserFeedbackController extends AbstractController{
	
	@Autowired
	private UserFeedbackService userFeedbackService;
	
	@PostMapping("submit")
	@ApiOperation("用户反馈")
	@ApiImplicitParams({ 
	})
	public ResultTO feedback(UserFeedback feedback) {
		Assert.isTrue(Tools.checkStringExist(feedback.getTitle()), "title content");
		Assert.isTrue(Tools.checkStringExist(feedback.getContent()), "empty content");
		Assert.isTrue(Tools.checkEmail(feedback.getEmail()), "wrong email");
		feedback.setCreateTime(new Date());
		feedback.setUserId(getUserId());
		feedback.setState((byte) 0);
		if (userFeedbackService.insert(feedback)>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}
	
	@SuppressWarnings("serial")
	@GetMapping("history")
	@ApiOperation("用户反馈历史")
	public ResultTO feedbackHistory(Integer page,Integer rows) {
		if (page==null) {
			page =1;
		}
		if (rows==null) {
			rows = 10;
		}
		Page pageData = userFeedbackService.page(new HashMap<String,Object>(){{
			put("userId", getUserId());
		}},page,rows);
		if (pageData!=null) {
			return ResultTO.newSuccessResult(pageData);
		}
		return ResultTO.newFailResult("fail");
	}
	
	
}
