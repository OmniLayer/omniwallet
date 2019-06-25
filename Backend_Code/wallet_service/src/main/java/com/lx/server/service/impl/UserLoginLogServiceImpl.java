package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.UserLoginLogDao;
import com.lx.server.service.UserLoginLogService;

/**
 * 【用户登录日志】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:46
 *
 */
@Service(value = "userLoginLogService")
public class UserLoginLogServiceImpl extends MybatisBaseServiceImpl implements UserLoginLogService {

    @Autowired
    private UserLoginLogDao userLoginLogDao;

    @Override
    public MyBatisBaseDao getDao() {
        return userLoginLogDao;
    }

}
