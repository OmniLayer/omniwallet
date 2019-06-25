package com.lx.server.walletapi.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.lx.server.bean.ResultTO;
import com.lx.server.pojo.UserClient;
import com.lx.server.service.WalletService;
import com.lx.server.utils.AESUtil;
import com.lx.server.utils.Tools;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;


@RestController
@RequestMapping("api/blockChain")
@Api(tags = { "区块链接口" })
public class BlockChainController extends AbstractController{
	
	@Autowired
    private WalletService walletServcie;
    
    //	@GetMapping("go")
	public String client() {
		String url = "http://39.105.139.121:8888/createAccount";
		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
		params.add("acc_name", "a");
		RestTemplate client = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		// 请勿轻易改变此提交方式，大部分的情况下，提交方式都是表单提交
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<MultiValueMap<String, String>>(params,headers);
		// 执行HTTP请求
		ResponseEntity<String> response = client.exchange(url, HttpMethod.POST, requestEntity, String.class);
		return response.getBody();
	}
    
    @GetMapping("createAddr")
    @ApiOperation("创建新的地址")
    public ResultTO createAddr(String account)throws Throwable{
    	return ResultTO.newSuccessResult(walletServcie.createNewAddress(account));
    }
    @GetMapping("createFixedProperty")
    public ResultTO createFixedProperty(String fromaddress,Integer ecosystem,Integer divideType,String name,BigDecimal amount) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.createFixedProperty(fromaddress,ecosystem,divideType,name,"",null, amount));
    }
    
    @GetMapping("createManageProperty")
    public ResultTO createManageProperty(String fromAddress,Integer ecosystem,Integer divideType,String name,String url) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.createManageProperty(fromAddress, ecosystem, divideType, name, url));
    }
    
    @GetMapping("getBTCAccount")
    @ApiOperation("获取btc的Account")
    public ResultTO getBTCAccount(String address) throws Exception{
    	return ResultTO.newSuccessResult("",walletServcie.getBTCAccount(address));
    }
    @GetMapping("getBtcBalance")
    @ApiOperation("获取btc的余额")
    public ResultTO getBtcBalance(String address) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getBtcBalance(address));
    }
    @ApiOperation("omni某个地址的所有资产信息")
    @GetMapping("getOmniAllBalance")
    public ResultTO getOmniAllBalance(String address) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getOmniAllBalance(address));
    }
    
    @ApiOperation("某个地址的所有资产信息")
    @GetMapping("getAllBalanceByAddress")
    public ResultTO getAllBalanceByAddress(String address) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getAllBalanceByAddress(address));
    }
    
    @ApiOperation("omni某个地址的某个资产的信息")
    @GetMapping("getOmniBalanceOfPropertyId")
    public ResultTO getOmniBalanceOfPropertyId(String address,Long propertyId) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getOmniBalanceOfPropertyId(address, propertyId));
    }
    @ApiOperation("omni获取资产列表")
    @GetMapping("getOmniListproperties")
    public ResultTO getOmniListproperties() throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getOmniListProperties());
    }
    @ApiOperation("omni根据资产id获取资产")
    @GetMapping("getOmniProperty")
    public ResultTO getOmniProperty(Long propertyId) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getOmniProperty(propertyId));
    }
    
    @ApiOperation("omni冻结")
    @GetMapping("omniSendFreeze")
    public ResultTO omniSendFreeze(String fromAddress,String toAddress,String name,Long propertyId,BigDecimal amount) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.omniSendFreeze(fromAddress, toAddress, propertyId, amount.toString()));
    }
    
    @ApiOperation("omni解冻")
    @GetMapping("omniSendUnfreeze")
    public ResultTO omniSendUnfreeze(String fromAddress,String toAddress,String name,Long propertyId,BigDecimal amount) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.omniSendUnfreeze(fromAddress, toAddress, propertyId, amount.toString()));
    }
    
    
    @ApiOperation("omni原生转账")
    @PostMapping("omniRawTransaction")
    public ResultTO omniRawTransaction(Integer propertyId, String fromBitCoinAddress,String privkey, String toBitCoinAddress, BigDecimal minerFee,BigDecimal amount, String note) throws Exception{
    	logger.info("omni原生转账");
    	UserClient userClient = getUser();
    	Assert.isTrue(Tools.checkStringExist(userClient.getPassword()), "pin is wrong");
    	privkey = AESUtil.decrypt(privkey, userClient.getPassword(), userClient.getId().substring(0, 16));
    	Assert.notNull(privkey, "privkey is wrong");
    	return ResultTO.newSuccessResult(walletServcie.omniRawTransaction(propertyId, fromBitCoinAddress, privkey, toBitCoinAddress, minerFee, amount, note));
    }
    
    @ApiOperation("btc转账")
    @PostMapping("btcSend")
    public ResultTO btcSend(String fromBitCoinAddress,String privkey,String toBitCoinAddress,BigDecimal amount,BigDecimal minerFee) throws Exception{
    	logger.info("btc转账");
    	UserClient userClient = getUser();
    	Assert.isTrue(Tools.checkStringExist(userClient.getPassword()), "pin is wrong");
    	privkey = AESUtil.decrypt(privkey, userClient.getPassword(), userClient.getId().substring(0, 16));
    	Assert.notNull(privkey, "privkey is wrong");
    	String ret =walletServcie.btcRawTransaction(fromBitCoinAddress, privkey, toBitCoinAddress, amount, minerFee,"");
    	if (ret!=null) {
    		return ResultTO.newSuccessResult("success",ret);
		}
    	return ResultTO.newFailResult("fail");
    }
    
    
    @ApiOperation("omni的交易")
    @GetMapping("getOmniTransaction")
    public ResultTO getOmniTransaction(String txid) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getOmniTransaction(txid));
    }
    @ApiOperation("btc的某个交易")
    @GetMapping("getBtcTransaction")
    public ResultTO getBtcTransaction(String txid) throws Exception{
    	return ResultTO.newSuccessResult(walletServcie.getBtcTransaction(txid));
    }
    @ApiOperation("btc的交易记录")
    @GetMapping("getBtcTransactions")
    public ResultTO getBtcTransactions(Integer pageIndex,Integer pageSize) throws Exception{
    	if (pageSize==null) {
			pageSize = 10;
		}
    	if (pageIndex==null) {
    		pageIndex = 1;
    	}
    	return ResultTO.newSuccessResult(walletServcie.listTransactions(pageIndex, pageSize));
    }
    
//    @ApiOperation("烧币")
//    @GetMapping("omniSendRevoke")
//    public ResultTO omniSendRevoke(String fromAddress,Long propertyId,BigDecimal amount) throws Exception{
//    	return ResultTO.newSuccessResult(walletServcie.omniSendRevoke(fromAddress, propertyId, amount.toString()));
//    }
//    
//    @ApiOperation("铸币")
//    @GetMapping("omniSendGrant")
//    public ResultTO omniSendGrant(String fromAddress,Long propertyId,BigDecimal amount) throws Exception{
//    	return ResultTO.newSuccessResult(walletServcie.omniSendGrant(fromAddress, propertyId, amount.toString()));
//    }
    
    @ApiOperation("同步btc交易到mysql")
    @GetMapping("sycBlockTransactions")
    public ResultTO sycBlockTransactions() throws Exception {
    	walletServcie.sycBlockTransactions();
    	return ResultTO.newSuccessResult("ok");
    }
    
    

}
