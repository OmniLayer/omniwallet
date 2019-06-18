package com.lx.server.service.impl;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.lx.server.config.JwtTokenUtil;
import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.dao.UserAdminDao;
import com.lx.server.pojo.UserAdmin;
import com.lx.server.service.UserAdminService;
import com.lx.server.utils.Tools;

/**
 * 【用户表】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-14 00:09:20
 *
 */
@Service(value = "userAdminService")
public class UserAdminServiceImpl extends MybatisBaseServiceImpl implements UserAdminService {

    @Autowired
    private UserAdminDao userAdminDao;
    

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public MyBatisBaseDao getDao() {
        return userAdminDao;
    }
    
    
    @SuppressWarnings("serial")
	@Override
    public String register(UserAdmin registerUser, String code, HttpServletRequest request) {
        List<UserAdmin> userList = getDao().selectObjectList(new HashMap<String, Object>() {{
            put("username", registerUser.getUsername());
        }});
        Boolean userIsNew = !(userList != null && !userList.isEmpty());
        Assert.isTrue(userIsNew,"用户已经存在");
        
        UserAdmin user = createOrGetUser(registerUser);
        user.setLastLoginTime(user.getLastLoginTime());
        return generateToken(user);
    }
    
    @SuppressWarnings("serial")
	private UserAdmin createOrGetUser(UserAdmin user) {
        String username = user.getUsername();
        List<UserAdmin> userList = getDao().selectObjectList(new HashMap<String, Object>() {{
            put("username", username);
        }});
        String rawPassword = user.getPassword();
        if (userList == null || userList.isEmpty()) {
            Date now = new Date();
            Assert.notNull(rawPassword, "用户密码不能为空");
            user.setPassword(Tools.getEncoder().encode(rawPassword.trim()));
            user.setCreateTime(now);
            user.setLastLoginTime(new Date());
            user.setNickname(username);
            userAdminDao.insert(user);
            return user;
        } 
        return user;
    }
    
    
    @Override
	public Object login(String username, String password) {
		List<UserAdmin> users =  userAdminDao.selectObjectList(new HashMap<String,Object>() {{
        	put("username", username);
        	put("isEnable", true);
        }});
		UserAdmin user =null;
        Assert.isTrue(users.size()>0,"用户不存在");
        if (users.size()>0) {
			user = users.get(0);
		}
        Assert.isTrue(Tools.getEncoder().matches(password, user.getPassword()),"密码错误");
        
        user.setLastLoginTime(new Date());
        Map<String, Object> condition = new HashMap<>();
        condition.put("id", user.getId());
        condition.put("lastLoginTime", user.getLastLoginTime());
        userAdminDao.update(condition);
        
        return generateToken(user);
	}
    
    @Override
	public String generateToken(UserAdmin user) {
		Map<String, Object> map = new HashMap<>();
        map.put("userId", user.getId());
        map.put(JwtTokenUtil.LastLoginTime, user.getLastLoginTime());
        map.put(JwtTokenUtil.CLAIM_KEY_CREATED, user.getLastPasswordResetDate());
        Pattern BCRYPT_PATTERN = Pattern.compile("\\A\\$2a?\\$\\d\\d\\$[./0-9A-Za-z]{53}");
        Assert.isTrue(user.getPassword() != null && BCRYPT_PATTERN.matcher(user.getPassword()).matches(),"用户密码为空");
        return jwtTokenUtil.generateToken(user, map);
	}
    
    @SuppressWarnings("serial")
	public Boolean changePsw(Integer userId,String psw) {
    	UserAdmin user = this.selectObject(userId);
		Assert.notNull(user, "用户不存在");
		if (this.update(new HashMap<String,Object>(){{
			put("id", userId);
			put("password", Tools.getEncoder().encode(psw.trim()));
			put("lastLoginTime", new Date());
			put("lastPasswordResetDate", new Date());
		}})>0) {
			return true;
		}
		return false;
	}
}
