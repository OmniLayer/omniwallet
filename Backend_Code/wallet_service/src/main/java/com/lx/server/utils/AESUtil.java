package com.lx.server.utils;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;

/**
 * @version V1.0
 * @desc AES 加密工具类
 */
public class AESUtil {

    private static final String KEY_ALGORITHM = "AES";
    private static final String DEFAULT_CIPHER_ALGORITHM = "AES/CBC/PKCS5Padding";//默认的加密算法

 // 加密
    public static String encrypt(String content, String psw, String ivParameter) throws Exception {
        Cipher cipher = Cipher.getInstance(AESUtil.DEFAULT_CIPHER_ALGORITHM);
        byte[] raw = psw.getBytes();
        SecretKeySpec skeySpec = new SecretKeySpec(raw, AESUtil.KEY_ALGORITHM);
        IvParameterSpec iv = new IvParameterSpec(ivParameter.getBytes());//使用CBC模式，需要一个向量iv，可增加加密算法的强度
        cipher.init(Cipher.ENCRYPT_MODE, skeySpec, iv);
        byte[] encrypted = cipher.doFinal(content.getBytes("utf-8"));
        return Base64.encodeBase64String(encrypted);//此处使用BASE64做转码。
    }

 // 解密
    public static String decrypt(String content, String psw, String ivParameter) throws Exception {
        try {
            byte[] raw = psw.getBytes("utf-8");
            SecretKeySpec skeySpec = new SecretKeySpec(raw, AESUtil.KEY_ALGORITHM);
            Cipher cipher = Cipher.getInstance(AESUtil.DEFAULT_CIPHER_ALGORITHM);
            IvParameterSpec iv = new IvParameterSpec(ivParameter.getBytes());
            cipher.init(Cipher.DECRYPT_MODE, skeySpec, iv);
            byte[] encrypted1 = Base64.decodeBase64(content);//先用base64解密
            byte[] original = cipher.doFinal(encrypted1);
            String originalString = new String(original,"utf-8");
            return originalString;
        } catch (Exception ex) {
            return null;
        }
	}
    

    public static void main(String[] args) throws Exception {
    	String cIv = "e9cc3f037e8ed880";
        String s = "L5i7jigYHYLyZbAsf9QUAc8BWtXq7YD6U7b7m8717Jg4xuxk5mAx";
//        String s = "++Vbcs3XporPFdLiZMdKlqgH2GSQc1aG86RSqo+kucg5dGlEPJ5GxQjiS0p4JL4jkwfZG6bTuZDzErSsQTCywQ==";
        String key = "e9cc3f037e8ed88090a7ed47d304b129";
        System.out.println("s:" + s);

        String s1 = AESUtil.encrypt(s, key,cIv);
        
        System.out.println("s1:" + s1);
        System.out.println("s2:"+AESUtil.decrypt(s1, key,cIv));
        

    }

}