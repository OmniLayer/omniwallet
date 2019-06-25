package com.lx.server.walletapi.config;

import java.util.Iterator;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.lx.server.bean.ResultTO;
import com.lx.server.service.UserClientService;
import com.lx.server.utils.Tools;


@Component
public class InputDataInterceptor extends HandlerInterceptorAdapter {
	
	/** Logger available to subclasses */
	protected final Log logger = LogFactory.getLog(getClass());
	
	@Value("${jwt.secret}")
	private String secret;
	
	@Value("${config.debug}")
    private Boolean debug; 
	
    public static Pattern pattern = Pattern.compile("[0-9]*(\\.?)[0-9]*");
	
	
	@Autowired
	UserClientService userClientService;
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		logger.info("requestURL： "+request.getRequestURL());
		
		if (!(HttpMethod.POST.name().equals(request.getMethod()))) {
            return true;
		}
		
		JSONObject jsonObject = new JSONObject();
		Map<String, String[]> map = request.getParameterMap();
		Iterator<?> it = map.keySet().iterator();
		while(it.hasNext()){
			String key = (String)it.next();
			String[] values = (String[])map.get(key);
			jsonObject.put(key, values[0]);
		}
		jsonObject.remove("dataMD5");
		jsonObject.remove("dataStr");
		//为了解决swagger的验证 swagger 不需要验证数据，上线后， debug为false
		if (debug&&request.getParameter("dataMD5")==null) {
			return true;
		}
		JSONObject jsonObject2 =JSONObject.parseObject(request.getParameter("dataStr"));
		for (String key : jsonObject2.keySet()) {
			jsonObject2.put(key, jsonObject2.get(key)!=null?jsonObject2.get(key).toString():"");
		}
		boolean flag = false;
		if (jsonObject2.equals(jsonObject)) {
			String dataMD5 = request.getParameter("dataMD5");
			String dataMD5Locale = Tools.MD5Encode(Tools.MD5Encode(request.getParameter("dataStr")+this.secret));
			if (dataMD5Locale.equals(dataMD5)==false) {
				flag = true;
			}
		}else {
			flag = true;
		}
		
		if (flag) {
			response.setCharacterEncoding("UTF-8");
			response.setContentType("text/html;charset=utf-8");
			response.setHeader("Cache-Control", "no-cache, must-revalidate");
			response.getWriter().write(JSON.toJSONString(ResultTO.newFailResult("error data")));
			return false;
		}
		
		return super.preHandle(request, response, handler);
	}
}
