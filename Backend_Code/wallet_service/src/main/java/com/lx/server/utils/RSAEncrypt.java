package com.lx.server.utils;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;

import org.apache.commons.codec.binary.Base64;

import lombok.Data;

public class RSAEncrypt {
	
	public static Map<String, RSAPairInfo> keyMap = new HashMap<String, RSAPairInfo>();  //用于封装随机产生的公钥与私钥
	
	private static Cipher cipher = null;
	
	public static void init() throws NoSuchAlgorithmException, NoSuchPaddingException {
		if (cipher==null) {
			cipher = Cipher.getInstance("RSA");
		}
	}
	
	
	/** 
	 * 随机生成密钥对 
	 * @throws NoSuchAlgorithmException 
	 * @throws NoSuchPaddingException 
	 */  
	public static String genKeyPair(String userId) throws NoSuchAlgorithmException {
		if (keyMap.containsKey(userId)) {
			keyMap.remove(userId);
		}
		// KeyPairGenerator类用于生成公钥和私钥对，基于RSA算法生成对象  
		KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");  
		// 初始化密钥对生成器，密钥大小为96-1024位  
		keyPairGen.initialize(512,new SecureRandom());  
		// 生成一个密钥对，保存在keyPair中  
		KeyPair keyPair = keyPairGen.generateKeyPair();  
		RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();   // 得到私钥  
		RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();  // 得到公钥  
		String publicKeyString = new String(Base64.encodeBase64(publicKey.getEncoded()));  
		// 得到私钥字符串  
		String privateKeyString = new String(Base64.encodeBase64((privateKey.getEncoded())));  
		RSAPairInfo info = new RSAPairInfo();
		info.setPrivateKey(privateKeyString);
		info.setPublicKey(publicKeyString);
		keyMap.put(userId, info);
		return info.getPublicKey();
	} 
	
	/** 
	 * RSA公钥加密 
	 * @param str 加密字符串
	 * @param publicKey 公钥 
	 * @return 密文 
	 * @throws Exception 加密过程中的异常信息 
	 */  
	public static String encrypt(String str, String publicKey) throws Exception{
		//base64编码的公钥
		byte[] decoded = Base64.decodeBase64(publicKey);
		RSAPublicKey pubKey = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
		//RSA加密
		cipher.init(Cipher.ENCRYPT_MODE, pubKey);
		String outStr = Base64.encodeBase64String(cipher.doFinal(str.getBytes("UTF-8")));
		return outStr;
	}

	/** 
	 * RSA私钥解密
	 *  
	 * @param str  加密字符串
	 * @param privateKey  私钥 
	 * @return 明文
	 * @throws Exception 
	 * 解密过程中的异常信息 
	 */  
	public static String decrypt(String str, String userId) throws Exception{
		if (keyMap.containsKey(userId)==false) {
			return null;
		}
		RSAPairInfo info = keyMap.get(userId);
		//64位解码加密后的字符串
		byte[] inputByte = Base64.decodeBase64(str.getBytes("UTF-8"));
		//base64编码的私钥
		byte[] decoded = Base64.decodeBase64(info.getPrivateKey());  
        RSAPrivateKey priKey = (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));  
		//RSA解密
		cipher.init(Cipher.DECRYPT_MODE, priKey);
		String outStr = new String(cipher.doFinal(inputByte));
		return outStr;
	}
}


@Data
class RSAPairInfo {
	private String publicKey;
	private String privateKey;
}
