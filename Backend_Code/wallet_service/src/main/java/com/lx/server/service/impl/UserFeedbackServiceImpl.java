package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.UserFeedbackDao;
import com.lx.server.service.UserFeedbackService;

/**
 * 【用户反馈】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:45
 *
 */
@Service(value = "userFeedbackService")
public class UserFeedbackServiceImpl extends MybatisBaseServiceImpl implements UserFeedbackService {

    @Autowired
    private UserFeedbackDao userFeedbackDao;

    @Override
    public MyBatisBaseDao getDao() {
        return userFeedbackDao;
    }

}
