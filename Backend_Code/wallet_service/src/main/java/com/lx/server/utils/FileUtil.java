package com.lx.server.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {
	public static List<String> readLines(File file) {
		if (!(file.isFile())) {
			throw new RuntimeException("文件" + file.getName() + "不是一个标准文件!");
		}

		List<String> list = new ArrayList<String>();

		FileReader fr = null;
		BufferedReader br = null;
		try {
			fr = new FileReader(file);
			br = new BufferedReader(fr);
			String line = br.readLine();
			while ((line != null) && (line.length() > 0)) {
				list.add(line);
				line = br.readLine();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			if (fr != null) {
				try {
					fr.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return list;
	}

	public static File makeDir(String dirName) {
		File file = new File(dirName);
		try {
			if ((!(file.exists())) && (!(file.exists()))) {
				file.mkdirs();
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("创建目录【" + dirName + "】失败!");
		}

		return file;
	}

	public static File makeDirAndFile(String fileName) {
		File file = new File(fileName);
		try {
			if (!(file.exists())) {
				File dir = file.getParentFile();
				if (!(dir.exists())) {
					dir.mkdirs();
				}

			}

			file.createNewFile();
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("创建文件【" + fileName + "】失败!");
		}

		return file;
	}

	public static void writeToFile(String outputFile, String str) {
		try {
			FileOutputStream out = new FileOutputStream(outputFile);
			out.write(str.getBytes("UTF-8"));
			out.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static String md5(File file) {
		String value = null;
		FileInputStream in = null;
		try {
			in = new FileInputStream(file);
			FileChannel channel = in.getChannel();
			MappedByteBuffer byteBuffer = channel.map(FileChannel.MapMode.READ_ONLY, 0L, file.length());
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			messageDigest.update(byteBuffer);
			BigInteger bi = new BigInteger(1, messageDigest.digest());
			value = bi.toString(16);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return value;
	}
}