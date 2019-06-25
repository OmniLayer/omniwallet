package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.PopularAssetDao;
import com.lx.server.service.PopularAssetService;

/**
 * 【平台推广资产列表】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-26 16:50:49
 *
 */
@Service(value = "popularAssetService")
public class PopularAssetServiceImpl extends MybatisBaseServiceImpl implements PopularAssetService {

    @Autowired
    private PopularAssetDao popularAssetDao;

    @Override
    public MyBatisBaseDao getDao() {
        return popularAssetDao;
    }

}
