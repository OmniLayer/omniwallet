package com.lx.server.service.impl;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.lx.server.bean.Page;
import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.MybatisBaseService;


public abstract class MybatisBaseServiceImpl implements MybatisBaseService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MybatisBaseServiceImpl.class);

    @Override
	public abstract MyBatisBaseDao getDao();

    @Override
    public <P> int insert(P parameter) {
        return getDao().insert(parameter);
    }

    @Override
    public <P> int update(P parameter) {
        return getDao().update(parameter);
    }

    @Override
    public <P> int delete(P parameter) {
        return getDao().delete(parameter);
    }

    @Override
    public <T, P> T selectObject(P parameter) {
        return getDao().selectObject(parameter);
    }

    @Override
    public <T, P> List<T> selectObjectList(P parameter) {
        return getDao().selectObjectList(parameter);
    }

    @Override
    public <V, P> Map<String, V> selectMap(P parameter) {
        return getDao().selectMap(parameter);
    }

    @Override
    public <V, P> List<Map<String, V>> selectMapList(P parameter) {
        return getDao().selectMapList(parameter);
    }

    @Override
    public Page page(Map<String, Object> map, int pageIndex, int pageSize) {
        int count = getDao().pageCount(map);
        pageIndex = pageIndex < 1 ? 1 : pageIndex;
        int offset = (pageIndex - 1) * pageSize;

        map.put("offset", Integer.valueOf(offset));
        map.put("rows", Integer.valueOf(pageSize));

        List<Object> list = getDao().page(map);

        return new Page(pageIndex, pageSize, count, list);
    }

    @Override
    public int pageCount(Map<String, Object> map) {
        return getDao().pageCount(map);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Page page(String pageSelectId, String pageCountSelectId, Map<String, Object> map, int pageIndex,
                     int pageSize) {
        MyBatisBaseDao dao = getDao();
        int count = 0;

        Class<?> clazz = dao.getClass();
        Method method = null;
        try {
            method = clazz.getDeclaredMethod(pageCountSelectId, Map.class);
        } catch (NoSuchMethodException e1) {
            LOGGER.error("分页查询【记录数】异常，请检查【{}.{}(Map<String,Object> map)】方法是否存在!",
                    new Object[]{dao.getClass().getName(), pageCountSelectId});
        } catch (SecurityException e1) {
            e1.printStackTrace();
        }
        try {
            try {
                count = ((Integer) method.invoke(dao, new Object[]{map})).intValue();
            } catch (ClassCastException e) {
                LOGGER.error("分页查询【记录数】异常，【{}.{}(Map<String,Object> map)】方法的返回值不是int类型!",
                        new Object[]{dao.getClass().getName(), pageCountSelectId});
            }
        } catch (IllegalAccessException e1) {
            e1.printStackTrace();
        } catch (IllegalArgumentException e1) {
            e1.printStackTrace();
        } catch (InvocationTargetException e1) {
            LOGGER.error("分页查询【记录数】异常，请检查Mapper.xml文件中是否有对应 select id 【{}】!", new Object[]{pageCountSelectId});
        }

        int offset = (pageIndex - 1) * pageSize;

        map.put("offset", Integer.valueOf(offset));
        map.put("rows", Integer.valueOf(pageSize));

        List<Object> list = null;

        Class<?> clazz2 = dao.getClass();
        Method method2 = null;
        try {
            method2 = clazz2.getDeclaredMethod(pageSelectId, Map.class);
        } catch (NoSuchMethodException e) {
            LOGGER.error("分页查询【记录数】异常，请检查【{}.{}(Map<String,Object> map)】方法是否存在!",
                    new Object[]{dao.getClass().getName(), pageSelectId});
        } catch (SecurityException e) {
            e.printStackTrace();
        }
        try {
            try {
                list = (List<Object>) method2.invoke(dao, new Object[]{map});
            } catch (ClassCastException e) {
                LOGGER.error("分页查询【记录数】异常，【{}.{}(Map<String,Object> map)】方法的返回值不是List类型!",
                        new Object[]{dao.getClass().getName(), pageSelectId});
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            LOGGER.error("分页查询【数据集】异常，请检查Mapper.xml文件中是否有对应 select id 【{}】!", new Object[]{pageSelectId});
        }

        return new Page(pageIndex, pageSize, count, list);
    }

    @Override
    public <P> void asyncInsert(P parameter) {

    }

    @Override
    public <P> void asyncUpdate(P parameter) {

    }

    @Override
    public <P> void asyncDelete(P parameter) {
    }

}
