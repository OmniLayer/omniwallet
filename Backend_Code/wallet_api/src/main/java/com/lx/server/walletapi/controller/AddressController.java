package com.lx.server.walletapi.controller;

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

import com.lx.server.bean.Page;
import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.DefaultAsset;
import com.lx.server.pojo.WalletAddress;
import com.lx.server.pojo.WalletAsset;
import com.lx.server.service.CommonService;
import com.lx.server.service.DefaultAssetService;
import com.lx.server.service.WalletAddressService;
import com.lx.server.service.WalletAssetService;
import com.lx.server.service.WalletService;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;

@RestController
@RequestMapping("api/wallet/address")
@Api(tags = {"钱包地址"})
public class AddressController extends AbstractController{
	

//	@Autowired
//    private KafkaTemplate<String, Object> kafkaTemplate;
	
	@Autowired
	private WalletAddressService walletAddressService;
	
	@Autowired
	private DefaultAssetService defaultAssetService;
	
	@Autowired
	private WalletAssetService assetService;
	
	@Autowired
	private WalletService walletServcie;
	
	@Autowired
	private CommonService commonService;
	
	
	@SuppressWarnings("serial")
	@PostMapping("changeAddressName")
	@ApiOperation("修改钱包名称")
	public ResultTO changeAddressName(String address,String addressName) {
		Assert.isTrue(Tools.checkStringExist(address), "address is empty");
		Assert.isTrue(Tools.checkStringExist(addressName), "addressName is empty");
		if (walletAddressService.update(new HashMap<String,Object>() {{
			put("n_address", address);
			put("n_userId", getUserId());
			put("addressName", addressName);
		}})>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}
	
	@GetMapping("getNewestAddressIndex")
	@ApiOperation("获取用户最新的地址索引")
	public ResultTO getNewestAddressIndex() {
		Integer index = commonService.getNewestAddressIndex(getUserId());
		return ResultTO.newSuccessResult("success",index);
	}
	
	
	@PostMapping("create")
	@ApiOperation("创建新地址")
	public ResultTO createAddress(WalletAddress walletAddress) {
		Assert.isTrue(Tools.checkStringExist(walletAddress.getAddress()), "address is empty");
		Assert.isTrue(Tools.checkStringExist(walletAddress.getAddressName()), "addressName is empty");
		Assert.isTrue(walletAddress.getAddressIndex()!=null&&walletAddress.getAddressIndex()>-1, "error  index ");
		
		walletAddress.setCreateTime(new Date());
		walletAddress.setIsEnable(true);
		walletAddress.setVisible(true);
		walletAddress.setUserId(getUserId());
		
		int count =  walletAddressService.pageCount(new HashMap<String,Object>() {{
			put("userId", walletAddress.getUserId());
			put("address", walletAddress.getAddress());
		}});
		Assert.isTrue(count==0, "address is exist");
		
		this.createWalletAddress(walletAddress);
		
		return ResultTO.newSuccessResult("success");
	}
	
	private void createWalletAddress(WalletAddress address) {
		logger.info("createWalletAddress");
		if (address!=null) {
			
			Assert.isTrue(Tools.checkStringExist(address.getAddressName())&&address.getAddressName().trim().length()<11, "error address name");
			Assert.isTrue(Tools.checkStringExist(address.getAddress()), "address can not be empty");
			
			address.setCreateTime(new Date());
			address.setIsEnable(true);
			address.setVisible(true);
			walletAddressService.insert(address);
			
			List<DefaultAsset> defaultAssets = defaultAssetService.selectObjectList(null);
			for (DefaultAsset defaultAsset : defaultAssets) {
				WalletAsset asset = new WalletAsset();
				asset.setUserId(getUserId());
				asset.setAssetName(defaultAsset.getAssetName());
				asset.setAddress(address.getAddress());
				asset.setVisible(true);
				asset.setAssetType((byte) (defaultAsset.getAssetId()==0?0:1));
				asset.setAssetId(defaultAsset.getAssetId());
				asset.setCreateTime(new Date());
				assetService.insert(asset);
			}
			
		}
	}
	
	
	
	
	
	@SuppressWarnings("serial")
	@PostMapping("addAsset")
	@ApiOperation("添加资产")
	public ResultTO setVisible(String address, Integer assetId,String assetName) {
		Assert.isTrue(Tools.checkStringExist(address), "address is null");
		Assert.notNull(assetId, "assetId is null");
		
		WalletAsset asset = new WalletAsset();
		asset.setUserId(getUserId());
		asset.setAssetName("Btc");
		asset.setAddress(address);
		asset.setVisible(true);
		asset.setAssetType((byte) 0);
		asset.setAssetId(assetId);
		asset.setCreateTime(new Date());
		
		int count = assetService.pageCount(new HashMap<String,Object>() {{
			put("address", asset.getAddress());
			put("assetId", asset.getAssetId());
		}});
		if (count>0) {
			assetService.update(new HashMap<String,Object>() {{
				put("address", asset.getAddress());
				put("assetId", asset.getAssetId());
				put("visible", true);
			}});
			return ResultTO.newSuccessResult("success");
		}
		
		if (assetService.insert(asset)>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}
	
	@SuppressWarnings("serial")
	@PostMapping("setVisible")
	@ApiOperation("设置address是否显示")
	public ResultTO setVisible(String address, Boolean visible) {
		Assert.isTrue(Tools.checkStringExist(address), "address is null");
		Assert.notNull(visible, "visible is null");
		if (walletAddressService.update(new HashMap<String,Object>() {{
			put("n_address", address);
			put("visible", visible);
		}})>0) {
			return ResultTO.newSuccessResult("success");
		}
		return ResultTO.newFailResult("fail");
	}
	
	
	
	@SuppressWarnings({ "serial", "unchecked" })
	@GetMapping("list")
	@ApiOperation("获取地址列表")
	public ResultTO getAddressList(Integer pageIndex,Integer pageSize) throws Exception {
		if (pageIndex==null||pageIndex<1) {
			pageIndex =1;
		}
		if (pageSize==null||pageSize<1) {
			pageSize =100;
		}
		Page page = this.walletAddressService.page(new HashMap<String,Object>() {{
			put("userId", getUserId());
		}}, pageIndex, pageSize);
		
		if (page!=null) {
			List<Object> nodes = page.getData();
			for (Object object : nodes) {
				
				Map<String, Object> node = (Map<String, Object>)object;
				String address = node.get("address").toString();
				
				//有转账记录的资产列表
				List<Map<String, Object>> list = walletServcie.getAllBalanceByAddress(address);
				
				for (Map<String, Object> btcNode : list) {
					btcNode.put("visible", true);
				}
				
				//获取数据库的某个地址的资产列表  有可能里面有的资产没有交易，就不在list里面   如果在list里面有的，assetllist没有，在设置asset显隐的地方处理
				List<Map<String, Object>> assetList = assetService.selectMapList(new HashMap<String,Object>() {{
					put("address", address);
					put("sortByCreate", true);
				}});
				
				boolean flag = false;
				for (Map<String, Object> map : assetList) {
					Integer assetId = (Integer) map.get("assetId");
					flag =true;
					for (Map<String, Object> btcNode : list) {
						Integer tempId = (Integer) btcNode.get("propertyid");
						if (assetId.compareTo(tempId)==0) {
							btcNode.put("visible", map.get("visible"));
							flag = false;//数据库数据找到了与omni的数据的对应
							break;
						}
					}
					if (flag) {
						Map<String, Object> btcNode = new HashMap<>();
						btcNode.put("propertyid", map.get("assetId"));
						btcNode.put("name", map.get("assetName"));
						btcNode.put("address", address);
						btcNode.put("account", "");
						btcNode.put("balance", 0);
						btcNode.put("reserved", 0);
						btcNode.put("frozen", 0);
						btcNode.put("visible", map.get("visible"));
						list.add(btcNode);
					}
				}
				node.put("assets", list);
			}
		}
		return ResultTO.newSuccessResult("success",page);
	}
	
	
	/**
	 * 根据address获取btc交易记录
	 * @return
	 * @throws Exception 
	 */
	@GetMapping("getTransactionsByAddress")
	@ApiOperation("根据address获取btc交易记录")
	public ResultTO getTransactionsByAddress(String address) throws Exception{
		Assert.isTrue(Tools.checkStringExist(address), "address is empty");
		Map<String, Object> data = commonService.getTransactionsByAddress(address);
		if (data!=null) {
			return ResultTO.newSuccessResult(data);
		}
		return ResultTO.newFailResult("fail");
	}
	
	/**
	 * 根据address获取omni交易记录
	 * @return
	 * @throws Exception 
	 */
	@GetMapping("getOmniTransactionsByAddress")
	@ApiOperation("根据address获取omni交易记录")
	public ResultTO getOmniTransactionsByAddress(String address,Integer assetId) throws Exception{
		Assert.isTrue(Tools.checkStringExist(address), "address is empty");
		Assert.isTrue(assetId!=null&&assetId>0, "assetId is empty");
		Map<String, Object> data = commonService.getOmniTransactions(address,assetId);
		if (data!=null) {
			return ResultTO.newSuccessResult(data);
		}
		return ResultTO.newFailResult("fail");
	}
}
