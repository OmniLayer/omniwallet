package com.lx.server.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.alibaba.fastjson.JSONObject;
import com.lx.server.dao.CommonDao;
import com.lx.server.dao.FpUserDao;
import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.enums.EnumFPConfigTypeName;
import com.lx.server.pojo.FpUser;
import com.lx.server.pojo.FpUserOmniAddress;
import com.lx.server.service.FpUserOmniAddressService;
import com.lx.server.service.FpUserService;
import com.lx.server.service.HyperledgerService;
import com.lx.server.service.WalletService;

/**
 * 【flashPay 快速支付的用户】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:56
 *
 */
@Service(value = "fpUserService")
public class FpUserServiceImpl extends MybatisBaseServiceImpl implements FpUserService {

    @Autowired
    private FpUserDao fpUserDao;
    
    @Autowired
	private CommonDao commonDao;
    
    @Autowired
	private WalletService walletService;
    
    @Autowired
	private HyperledgerService hyperledgerService;
    
    @Autowired
    private FpUserOmniAddressService addressService;

    @Override
    public MyBatisBaseDao getDao() {
        return fpUserDao;
    }
    
    private Integer getConfigParamValueByKey(EnumFPConfigTypeName typeName) {
		Integer value = commonDao.getConfigParamValueByKey(typeName.value);
		Assert.notNull(value, typeName+"'s not exist");
		return value;
	}

	@Override
	@Transactional(isolation = Isolation.DEFAULT, propagation = Propagation.REQUIRED)
	public Map<String, Object> create(String userId, String email) throws Exception {
		
		Integer initOmniAmount =getConfigParamValueByKey(EnumFPConfigTypeName.initOmniAmount);
		if (initOmniAmount<1) {
			initOmniAmount = 3;
		}
		
		List<String> addresses = new ArrayList<>();
		for(int i=0;i<initOmniAmount;i++) {
			addresses.add(walletService.createNewAddress(email));
		}
		
		JSONObject js = hyperledgerService.createAccount(email);
		if (js!=null) {
			FpUser user = new FpUser();
			user.setUserId(userId);
			user.setHpyerUsername(email);
			user.setCreateTime(new Date());
			fpUserDao.insert(user);
			
			for (String addr : addresses) {
				FpUserOmniAddress omniAddress = new FpUserOmniAddress();
				omniAddress.setFpUserId(user.getId());
				omniAddress.setOmniAddress(addr);
				omniAddress.setCreateTime(user.getCreateTime());
				addressService.insert(omniAddress);
			}
			Map<String, Object> userVO = new HashMap<>();
			userVO.put("email", email);
			userVO.put("addresses", addresses);
			return userVO;
		}
		return null;
	}

}
