package com.lx.server.admin.controller;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.UserClient;
import com.lx.server.service.MybatisBaseService;
import com.lx.server.service.UserClientService;
import com.lx.server.utils.Tools;

import io.jsonwebtoken.Claims;

/**
 * 控制器抽象类 手机接口控制器 和 web控制器需继承此类
 */
public abstract class AbstractController {

	protected final Log logger = LogFactory.getLog(getClass());
    
    @Autowired
    protected HttpServletRequest request;
    
    @Autowired
    protected HttpServletResponse response;
    
    @Autowired
    public UserClientService userClientService;
    
    protected Integer getUserId() {
    	if (request==null) {
			return null;
		}
    	Claims claims = (Claims) request.getAttribute("claims");
        Assert.notNull(claims, "用户不存在");
        return (Integer) claims.get("userId");
    }
    
	protected UserClient getUser() {
    	if (request==null) {
			return null;
		}
    	UserClient user = (UserClient) request.getAttribute("user");
        Assert.notNull(user, "用户不存在");
        return user;
    }
	
	 protected <P> ResultTO baseEdit(@ModelAttribute P record ,Integer id, MybatisBaseService service) throws InvocationTargetException, IllegalAccessException {
		if (id != null) {
			service.update(Tools.getClassMaps(record));
        } else {
        	service.insert(record);
        }
        return ResultTO.newSuccessResult("操作成功",record);
	}
    
    protected <T> List<Object> convertObj(T obj,List<String> titles) throws IllegalAccessException, IllegalArgumentException, InvocationTargetException{
		List<Object> row = new ArrayList<>();
		Method[] methods = obj.getClass().getMethods();
		for (String title : titles) {
			for (Method method : methods) {
	            if (StringUtils.endsWithIgnoreCase(method.getName(), "get"+title)) {
	                Object param = method.invoke(obj);
	                if (param==null) {
	                	row.add("");
					}else {
						row.add(param);
					}
	                break;
	            }
	        }
		}
		return row;
	}
    
    /**
     * 单图片上传
     */
    public String uploadImage(String imageUrl,MultipartFile... files) {
        return Tools.uploadImages(imageUrl,files);
    }
}
