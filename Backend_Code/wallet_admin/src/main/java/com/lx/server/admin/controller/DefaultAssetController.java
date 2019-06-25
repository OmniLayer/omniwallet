package com.lx.server.admin.controller;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lx.server.bean.Page;
import com.lx.server.bean.ResultTO;
import com.lx.server.enums.EnumFolderURI;
import com.lx.server.pojo.DefaultAsset;
import com.lx.server.service.DefaultAssetService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("admin/asset/default")
@Api(tags = {"默认资产管理"})
public class DefaultAssetController extends AbstractController{
	
	@Autowired
	private DefaultAssetService service;
	
	@SuppressWarnings("serial")
	@PostMapping(value = "edit")
	@ApiOperation("新增或者编辑")
    public ResultTO edit(DefaultAsset record,MultipartFile file) throws InvocationTargetException, IllegalAccessException {
		int count = 0;
		
		if (file!=null) {
			String url = this.uploadImage(EnumFolderURI.coinImage.value, file);
			record.setImageUrl(url);
		}
		
        if (record.getId() != null) {
        	DefaultAsset node = service.selectObject(record.getId());
        	Assert.notNull(node, "数据不存在");
        	if (Tools.checkStringExist(record.getAssetName())) {
				if (record.getAssetName().trim().equals(node.getAssetName())==false) {
					count = service.pageCount(new HashMap<String,Object>() {{
						put("assetName", record.getAssetName().trim());
					}});
				}
			}else {
				record.setAssetName(node.getAssetName());
			}
        	record.setAssetId(null);
        } else {//新增
        	Assert.notNull(record.getAssetId(),"资产id不能为空");
        	count = service.pageCount(new HashMap<String,Object>() {{
				put("assetId", record.getAssetId());
			}});
        	Assert.isTrue(count==0, "资产id已经存在，不能重复添加");
        	
        	Assert.isTrue(Tools.checkStringExist(record.getAssetName()),"名称不能为空");
        	record.setCreateBy(getUserId());
        	record.setCreateTime(new Date());
        	record.setAssetName(record.getAssetName().trim());
        	count = service.pageCount(new HashMap<String,Object>() {{
				put("assetName", record.getAssetName());
			}});
        }
        
        Assert.isTrue(count==0, "数据已经存在，不能重复添加");
        
        return this.baseEdit(record, record.getId(), service);
    }
	
	@PostMapping(value = "del")
	@Transactional(isolation = Isolation.DEFAULT, propagation = Propagation.REQUIRED)
	@ApiOperation("删除")
    public ResultTO delete(Integer id) throws Exception {
		Assert.notNull(id, "id不能为空");
        if (service.delete(id)>0) {
			return ResultTO.newSuccessResult("删除成功");
		}
        return ResultTO.newFailResult("删除失败");
    }
	
	@PostMapping("page")
	@ApiOperation("列表")
	public Page page(DefaultAsset item, Integer page,Integer rows) throws InvocationTargetException, IllegalAccessException{
		if (page==null) {
			page =1;
		}
		if (rows==null) {
			rows = 1000;
		}
		Tools.InitKeywordParam(item);
		return service.page(Tools.getClassMaps(item), page, rows);
	}

	
}
