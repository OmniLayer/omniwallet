package com.lx.server.admin.controller;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lx.server.bean.Page;
import com.lx.server.bean.ResultTO;
import com.lx.server.enums.EnumFolderURI;
import com.lx.server.pojo.AppVersion;
import com.lx.server.service.AppVersionService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

/**
 * 版本控制
 * @author ZhuGuojun
 */
@RestController
@RequestMapping(value = "admin/app/version")
@Api(tags = {"版本控制"})
public class AppVersionController extends AbstractController {

    @Autowired
    private AppVersionService appVersionService;


    @GetMapping("item")
    @ApiOperation("获取详情")
    public ResultTO item(Integer id) {
    	Assert.notNull(id, "id不能为空");
        AppVersion record = appVersionService.selectObject(id);
        if (record != null) {
			return ResultTO.newSuccessResult(record);
		}
        return ResultTO.newFailResult("获取失败");
    }
    
    //设置某一项
    @SuppressWarnings("unchecked")
	@PostMapping("add")
    @ApiOperation("新增")
    public Object edit(AppVersion record, MultipartFile pathFile){
    	
    	record.setCode(null);
    	
    	if (pathFile!=null &&!pathFile.isEmpty()&&Tools.checkStringExist(record.getPath())==false){
	        record.setPath(this.uploadImage(EnumFolderURI.appPack.value,pathFile));
	    }
        
        Page page = appVersionService.page(new HashMap<String, Object>(), 1, 1);
        Integer code = 1;
        if (page!=null) {
			List<Object> datas = page.getData();
			if (datas!=null&&datas.size()==1) {
				Map<String, Object> data = (Map<String, Object>) datas.get(0);
				code = Integer.parseInt(data.get("code").toString());
				code = code+1;
			}
		}
        record.setCode(code);
        if (record.getIsForce()==null) {
			record.setIsForce(false);
		}
        if (Tools.checkStringExist(record.getName())==false) {
        	record.setName("version_"+code);
        }
        
        record.setCreateTime(new Date());
        record.setCreateBy(getUserId());
        appVersionService.insert(record);
        return ResultTO.newSuccessResult("ok");
    }

    @PostMapping("/page")
    @ApiOperation("所有")
    public Page page(AppVersion record, Integer page, Integer rows) throws InvocationTargetException, IllegalAccessException {
    	if (page==null) {
			page =1;
		}
		if (rows==null) {
			rows = 100;
		}
        Map<String, Object> map = Tools.getClassMaps(record);
        return appVersionService.page(map, page, rows);
    }
}
