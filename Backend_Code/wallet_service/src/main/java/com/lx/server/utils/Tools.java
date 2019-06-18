package com.lx.server.utils;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.lx.server.config.CustomPasswordEncoder;
import com.lx.server.config.GlobalConfig;
import com.lx.server.pojo.AbstractObject;

public class Tools {

	
    private final static String[] hexDigits = {"0", "1", "2", "3", "4", "5", "6", "7",
            "8", "9", "a", "b", "c", "d", "e", "f"};
    public static boolean Debug = true;

    public static boolean isMobileNO(String mobiles) {
        if (mobiles == null) {
            return false;
        }
        Pattern p = Pattern.compile("^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$");
        Matcher m = p.matcher(mobiles);
        return m.matches();
    }

    public static boolean checkTelephone(String telephone) {
    	if (StringUtils.isEmpty(telephone)) {
			return false;
		}
        String regex = "^[0][1-9]{2,3}(-|)[0-9]{5,10}$";
        Pattern p = Pattern.compile(regex);
        Matcher m = p.matcher(telephone);
        if (m.matches() == false) {
            regex = "^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$";
            p = Pattern.compile(regex);
            m = p.matcher(telephone);
            return m.matches();
        } else {
            return true;
        }
    }

    public static String getIpAddr(HttpServletRequest request) {
    	 String ip = request.getHeader("x-forwarded-for"); 
         if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {  
             // 多次反向代理后会有多个ip值，第一个ip才是真实ip
             if( ip.indexOf(",")!=-1 ){
                 ip = ip.split(",")[0];
             }
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getHeader("Proxy-Client-IP");  
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getHeader("WL-Proxy-Client-IP");  
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getHeader("HTTP_CLIENT_IP");  
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getHeader("HTTP_X_FORWARDED_FOR");  
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getHeader("X-Real-IP");  
         }  
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {  
             ip = request.getRemoteAddr();  
         } 
         return ip;  
    }

    public static String createRandomCodeByLength(int length) {
        String code = "";
        if (length < 0) {
            length = 0;
        }
        for (int i = 0; i < length; i++) {
            int j = (int) (Math.random() * 10);
            j = j > 9 ? 9 : j;
            code += j + "";
        }
        return code;
    }

    /**
     * 日期验证正则表达式
     *
     * @param dateStr
     * @return
     */
    public static boolean isDateFormat(String dateStr) {
        if (dateStr == null || dateStr.length() == 0) {
            return false;
        }
        Pattern p = Pattern.compile("^((\\d{2}(([02468][048])|([13579][26]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])))))|(\\d{2}(([02468][1235679])|([13579][01345789]))[\\-\\/\\s]?((((0?[13578])|(1[02]))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\\-\\/\\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\\-\\/\\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\\s(((0?[0-9])|([1-2][0-3]))\\:([0-5]?[0-9])((\\s)|(\\:([0-5]?[0-9])))))?$");
        return p.matcher(dateStr).matches();
    }

    /**
     * 时间验证正则表达式 4：50
     *
     * @param dateStr
     * @return
     */
    public static boolean isTimeFormat(String dateStr) {
        if (dateStr == null || dateStr.length() == 0) {
            return false;
        }
        Pattern p = Pattern.compile("^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$");
        return p.matcher(dateStr).matches();
    }

    /**
     * 验证身份证号
     *
     * @return
     */
    public static boolean isIDNum(String num) {
        String reg = "^\\d{15}$|^\\d{17}[0-9Xx]$";
        if (num != null && num.trim().matches(reg)) {
            if (verify(num.trim().toCharArray())) {
                return true;
            }
        }
        return false;
    }

    /**
     * 身份证最后一位的校验算法
     *
     * @param id
     * @return
     */
    public static boolean verify(char[] id) {
        int sum = 0;
        int w[] = {7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2};
        char[] ch = {'1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'};
        for (int i = 0; i < id.length - 1; i++) {
            sum += (id[i] - '0') * w[i];
        }
        int c = sum % 11;
        char code = ch[c];
        char last = id[id.length - 1];
        last = last == 'x' ? 'X' : last;
        return last == code;
    }

    public static boolean isInteger(String s) {
        if (s != null && !"".equals(s.trim()))
            return s.matches("^[0-9]*$");
        else
            return false;
    }

    public static boolean isNumeric(String str) {
        if (str == null) {
            return false;
        }
        for (int i = 0; i < str.length(); i++) {
            if (!Character.isDigit(str.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    public static String generateOrderNumPre() {
        String str = System.currentTimeMillis() + "";
        return str.substring(str.length() - 8);
    }

    //生成用户订单号
    public static String generateOrderNumByUid(int uid) {
        String str = generateOrderNumPre() + String.format("%06d", uid % 1000000);
        return str;
    }

    /**
     * 单图片上传
     */
    public static String uploadMultimedia(MultipartFile file, String imageUrl) {
        String url = null;
        if (file != null) {
            try {
                // 检验文件夹是否存在，不存在 就创建
                FileUtil.makeDir(GlobalConfig.BASE_IMAGE_ADDRESS + imageUrl);
                // 文件后缀名
                String suffix = file.getOriginalFilename().substring(
                        file.getOriginalFilename().lastIndexOf(".") + 1,
                        file.getOriginalFilename().length());
                // 拿到输出流，同时重命名上传的文件
                // String imageName = new Date().getTime() +
                // files[i].getOriginalFilename();
                String imageName = UUID.randomUUID().toString() + "." + suffix;
                imageName = imageName.replaceAll("-", "");
                FileOutputStream os = new FileOutputStream( GlobalConfig.BASE_IMAGE_ADDRESS +imageUrl + imageName);
                // 拿到上传文件的输入流
                InputStream in = file.getInputStream();
                // 以写字节的方式写文件
                int len = 0;
                byte[] bb = new byte[4096];
                while ((len = in.read(bb)) != -1) {
                    os.write(bb, 0, len);
                }
                os.flush();
                os.close();
                in.close();
                url = imageUrl + imageName;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return url;
    }

    /**
     * 多文件上传
     *
     * @param files
     * @param imageUrl
     * @return
     */
    public static String uploadImages(String imageUrl, MultipartFile... files) {
        String urls = null;
        if (files == null || files.length == 0) {
            return urls;
        }
        for (int i = 0; i < files.length; i++) {
            String url = Tools.uploadMultimedia(files[i], imageUrl);
            if (url != null && urls == null) {
                urls = url + ",";
            } else if (url != null && urls != null) {
                urls += url + ",";
            }
        }
        if (urls != null) {
            urls = urls.substring(0, urls.length() - 1);
        }
        return urls;
    }

    public static <T> Map<String, Object> getClassMaps(T obj, String paramPrefix) throws InvocationTargetException, IllegalAccessException {
        Method[] methods = obj.getClass().getMethods();
        Map<String, Object> map = new HashMap<>();
        for (Method method : methods) {
            if (method.getName().startsWith("get")) {
                String name = method.getName();
                String methodName = name.substring("get".length());
                Object param = method.invoke(obj);
                if (param != null) {
                    String prefix = methodName.substring(0, 1).toLowerCase();
                    if (method.getName().equals("getId") == false)
                        methodName = paramPrefix + prefix + methodName.substring(1);
                    else
                        methodName = prefix + methodName.substring(1);

                    map.put(methodName, param);
                }
            }
        }
        return map;
    }
    
    public static <T> Map<String, Object> getClassMapsAllField(T obj) throws InvocationTargetException, IllegalAccessException {
    	Method[] methods = obj.getClass().getMethods();
    	Map<String, Object> map = new HashMap<>();
    	for (Method method : methods) {
    		if (method.getName().startsWith("get")) {
    			String name = method.getName();
    			String methodName = name.substring("get".length());
    			Object param = method.invoke(obj);
    			String prefix = methodName.substring(0, 1).toLowerCase();
				if (method.getName().equals("getId") == false)
					methodName = prefix + methodName.substring(1);
				else
					methodName = prefix + methodName.substring(1);
				
				map.put(methodName, param);
    		}
    	}
    	return map;
    }

    public static <T> Map<String, Object> getClassMaps(T obj) throws InvocationTargetException, IllegalAccessException {
        return getClassMaps(obj, "");
    }

    public static String produceRandomCodeByLength(int length) {
        String code = "";
        if (length < 0) {
            length = 0;
        }
        for (int i = 0; i < length; i++) {
            int j = (int) (Math.random() * 10);
            j = j > 9 ? 9 : j;
            code += j + "";
        }
        return code;
    }

    //资金交易流水号
    public static String generateTradeNo(int type, int uid) {
        String no = generateOrderNumPre() + String.format("%02d", type % 100) + String.format("%06d", uid % 1000000);
        return no;
    }

    public static String map2str(Map<String, String> map) {
        String xmlStr = null;
        StringBuffer sbf = new StringBuffer();
        sbf.append("<xml>");
        for (Map.Entry<String, String> s : map.entrySet()) {

            sbf.append("<")
                    .append(s.getKey())
                    .append(">")
                    .append(s.getValue())
                    .append("</")
                    .append(s.getKey())
                    .append(">");

        }
        sbf.append("</xml>");
        xmlStr = sbf.toString();
        return xmlStr;
    }


    /**
     * 转换字节数组为16进制字串
     *
     * @param b 字节数组
     * @return 16进制字串
     */
    public static String byteArrayToHexString(byte[] b) {
        StringBuilder resultSb = new StringBuilder();
        for (byte aB : b) {
            resultSb.append(byteToHexString(aB));
        }
        return resultSb.toString();
    }

    /**
     * 转换byte到16进制
     *
     * @param b 要转换的byte
     * @return 16进制格式
     */
    private static String byteToHexString(byte b) {
        int n = b;
        if (n < 0) {
            n = 256 + n;
        }
        int d1 = n / 16;
        int d2 = n % 16;
        return hexDigits[d1] + hexDigits[d2];
    }

    /**
     * MD5编码
     *
     * @param origin 原始字符串
     * @return 经过MD5加密之后的结果
     */
    public static String MD5Encode(String origin) {
        String resultString = null;
        try {
            resultString = origin;
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(resultString.getBytes("UTF-8"));
            resultString = byteArrayToHexString(md.digest());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return resultString;
    }

    public static String printStackTraceToString(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw, true));
        return sw.getBuffer().toString();
    }
    /**
     * 获取未来 第 past 天的日期
     *
     * @param past
     * @return
     */
    public static Date getFetureDate(Integer past) {
        if (past == null) {
            past = 0;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.DAY_OF_YEAR, calendar.get(Calendar.DAY_OF_YEAR) + past);
        return calendar.getTime();
    }

    /**
     * 获取未来 某天的 第 past 天的日期
     *
     * @param past
     * @return
     */
    public static Date getFetureDate(Date beginTime, Integer past) {
        if (past == null) {
            past = 0;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(beginTime);
        calendar.set(Calendar.DAY_OF_YEAR, calendar.get(Calendar.DAY_OF_YEAR) + past);
        return calendar.getTime();
    }

    public static String trimEndChar(String string) {
        return trimEndChar(string, false);
    }

    public static String trimEndChar(String string, Boolean trimEnd) {
        if (string == null || string.length() == 0) {
            return "";
        }
        string = string.trim();
        if (string.length() == 1) {
            return string;
        }
        if (trimEnd) {
            string = string.substring(0, string.length() - 1);
        }
        return string;
    }

    /**
     * 初始化后台的关键字，时间段
     *
     * @param record
     */
    public static void InitKeywordParam(AbstractObject record) {
        if (record.getBeginTime() != null) {
            if (record.getEndTime() == null) {
                record.setEndTime(Tools.getFetureDate(1));
            }
        }
        if (record.getEndTime() != null) {
            if (record.getBeginTime() == null) {
                record.setBeginTime(Tools.getFetureDate(-365));
            }
        }
        if (Tools.checkStringExist(record.getKeyword())==false) {
        	record.setKeyword(null);
		}else{
			record.setKeyword(record.getKeyword().trim());
		}
    }

    public static boolean checkStringExist(String string) {
		if(string==null)
			return false;
		if (string.trim().length()==0) {
			return false;
		}
		return true;
	}

    public static String formatDate(Date date) {
    	SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
	}
    
    
    public static int getIntegerFormObject(Object object,Integer defaultValue) {
		if (object!=null) {
			try {
				return Integer.parseInt(object.toString());
			} catch (Exception e) {
				return defaultValue;
			}
		}
		return defaultValue;
	}

	public static boolean checkEmail(String username) {
		if (checkStringExist(username)==false) {
			return false;
		}
		try {
			final String pattern1 = "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$";
			final Pattern pattern = Pattern.compile(pattern1);
			final Matcher mat = pattern.matcher(username);
			return mat.matches();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
	}

	public static boolean isValidMessageAudio(String msg) {
		Assert.isTrue(Tools.checkStringExist(msg), "input is empty");
		msg = msg.trim();
		int cnt = 0;
	    for (int i=0; i<msg.length(); ++i) {
	        switch (msg.charAt(i)) {
	            case '0': case '1': case '2': case '3': case '4':
	            case '5': case '6': case '7': case '8': case '9':
	            case 'a': case 'b': case 'c': case 'd': case 'e': case 'f':
	            case 'A': case 'B': case 'C': case 'D': case 'E': case 'F':
	                ++ cnt;
	                if (32 <= cnt) return true;
	                break;
	            case '/':
	                if ((i + 10) < msg.length()) {
	                    char ch1 = msg.charAt(i+1);
	                    char ch2 = msg.charAt(i+8);
	                    if ('/' == ch2 && ('s' == ch1 || 'S' == ch1)) return true;
	                }
	            default:
	                cnt = 0;
	                break;
	        }
	    }
	    return false;
	}
	
	static CustomPasswordEncoder encoder;
	public static CustomPasswordEncoder getEncoder() {
        if (encoder == null) {
            encoder = new CustomPasswordEncoder();
        }
        return encoder;
    }
}
