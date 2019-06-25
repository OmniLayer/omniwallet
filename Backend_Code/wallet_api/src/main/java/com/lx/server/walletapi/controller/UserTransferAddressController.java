package com.lx.server.walletapi.controller;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.UserTransferAddress;
import com.lx.server.service.UserTransferAddressService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("api/user/transferAddress")
@Api(tags = {"用户常用转账地址"})
public class UserTransferAddressController extends AbstractController {
	
	@Autowired
	private UserTransferAddressService userTransferAddressService;
	
	@SuppressWarnings("serial")
	@PostMapping("edit")
	@ApiOperation("创建或者编辑地址")
	public ResultTO createAddress(UserTransferAddress transferAddress) throws InvocationTargetException, IllegalAccessException {
		Assert.isTrue(Tools.checkStringExist(transferAddress.getAddress())&&transferAddress.getAddress().trim().length()<40, "address is error");
		Assert.isTrue(Tools.checkStringExist(transferAddress.getNickname())&&transferAddress.getNickname().trim().length()<20, "name is error");
		
		int count =  userTransferAddressService.pageCount(new HashMap<String,Object>() {{
			put("userId", getUserId());
			put("address", transferAddress.getAddress());
		}});
		if (transferAddress.getId()==null) {
			transferAddress.setCreateTime(new Date());
			transferAddress.setUserId(getUserId());
			Assert.isTrue(count==0, "address is exist");
			if (userTransferAddressService.insert(transferAddress)>0) {
				return ResultTO.newSuccessResult("success");
			}
		}
		if (transferAddress.getId()!=null) {//如果是编辑，需要检查当前的地址是不是有修改，如果有修改，就需要检查新的地址是否有重复
			UserTransferAddress node = userTransferAddressService.selectObject(transferAddress.getId());
			Assert.notNull(node, "old addres not exist"); 
			if (node.getAddress().equals(transferAddress.getAddress())==false) {
				Assert.isTrue(count==0, "address is exist");
			}
			if (userTransferAddressService.update(Tools.getClassMaps(transferAddress))>0) {
				return ResultTO.newSuccessResult("success");
			}
		}
		
		if (userTransferAddressService.insert(transferAddress)>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}
	@SuppressWarnings({ "serial"})
	@GetMapping("list")
	@ApiOperation("获取地址列表")
	public ResultTO getAddressList() throws Exception {
		List<UserTransferAddress> list = this.userTransferAddressService.selectObjectList(new HashMap<String,Object>() {{
			put("userId", getUserId());
		}});
		return ResultTO.newSuccessResult("success",list);
	}
	
	@GetMapping("delAddress")
	@ApiOperation("删除地址")
	public ResultTO delAddress(Integer id) throws Exception {
		if (userTransferAddressService.delete(id)>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}

}
