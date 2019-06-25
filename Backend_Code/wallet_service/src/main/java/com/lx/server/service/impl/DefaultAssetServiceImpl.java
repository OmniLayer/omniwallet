package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.DefaultAssetDao;
import com.lx.server.service.DefaultAssetService;

/**
 * 【平台默认创建资产列表】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-15 22:30:09
 *
 */
@Service(value = "defaultAssetService")
public class DefaultAssetServiceImpl extends MybatisBaseServiceImpl implements DefaultAssetService {

    @Autowired
    private DefaultAssetDao defaultAssetDao;

    @Override
    public MyBatisBaseDao getDao() {
        return defaultAssetDao;
    }

}
