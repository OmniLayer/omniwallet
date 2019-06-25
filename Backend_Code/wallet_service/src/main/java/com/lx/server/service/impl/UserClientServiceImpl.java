package com.lx.server.service.impl;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.lx.server.config.JwtTokenUtil;
import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.dao.UserClientDao;
import com.lx.server.pojo.UserClient;
import com.lx.server.service.UserClientService;
import com.lx.server.utils.Tools;

/**
 * 【钱包客户端用户】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:45
 *
 */
@Service(value = "userClientService")
public class UserClientServiceImpl extends MybatisBaseServiceImpl implements UserClientService {

    @Autowired
    private UserClientDao userClientDao;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public MyBatisBaseDao getDao() {
        return userClientDao;
    }

	@Override
	public Map<String, Object> createNewUser(String userId,String nickname,String password) throws InvocationTargetException, IllegalAccessException {
		UserClient userClient =  userClientDao.selectObject(userId);
		Assert.isNull(userClient, "用户已经存在");
		userClient = new UserClient();
		userClient.setId(userId);
		if (Tools.checkStringExist(nickname)==false) {
			nickname = "匿名用户";
		}
		userClient.setNickname(nickname);
		userClient.setGoogleAuthCode("");
		userClient.setPassword(password);
		userClient.setGoogleAuthEnable(false);
		userClient.setCreateTime(new Date());
		userClient.setLastLoginTime(new Date());
		if (userClientDao.insert(userClient)>0) {
			Map<String, Object> userMap = Tools.getClassMaps(userClient);
			userMap.put("token", this.generateToken(userClient));
			return userMap;
		}
		return null;
	}
	
	 @Override
	public String generateToken(UserClient user) {
		Map<String, Object> map = new HashMap<>();
        map.put("userId", user.getId());
        map.put(JwtTokenUtil.LastLoginTime, user.getLastLoginTime());
        return jwtTokenUtil.generateClientToken(user, map);
	}
	
	

}
