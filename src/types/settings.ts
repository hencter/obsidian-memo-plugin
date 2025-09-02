/**
 * 插件设置相关的类型定义
 */

/** 通知消息配置接口 */
export interface NotificationSettings {
	/** 备忘录已保存消息 */
	memoSaved: string;
	/** 保存失败消息 */
	saveFailed: string;
	/** 编辑器未初始化消息 */
	editorNotInitialized: string;
	/** 请输入内容消息 */
	pleaseEnterContent: string;
	/** 添加到日记失败消息 */
	addToDailyNoteFailed: string;
}

/** 插件主设置接口 */
export interface MemoPluginSettings {
	/** 备忘录存储目录 */
	memosDirectory: string;
	
	/** 日记存储目录 */
	dailyNoteDirectory: string;
	
	/** 日记日期格式 */
	dailyNoteDateFormat: string;
	
	/** 时间戳格式 */
	timestampFormat: string;
	
	/** 编辑器占位符文本 */
	editorPlaceholder: string;
	
	/** 视图显示名称 */
	viewDisplayName: string;
	
	/** 视图图标 */
	viewIcon: string;
	
	/** 是否自动添加到日记 */
	autoAddToDailyNote: boolean;
	
	/** 日记模板 */
	dailyNoteTemplate: string;
	
	/** 备忘录部分识别标题列表 */
	memoSectionHeaders: string[];
	
	/** 通知消息配置 */
	notifications: NotificationSettings;
}

/** 默认设置值 - 使用 Partial 类型以支持部分配置 */
export const DEFAULT_SETTINGS: Partial<MemoPluginSettings> = {
	memosDirectory: 'Memos',
	dailyNoteDirectory: 'Daily Notes',
	dailyNoteDateFormat: 'YYYY-MM-DD',
	timestampFormat: 'YYYYMMDDHHmm',
	editorPlaceholder: "What's on your mind?",
	viewDisplayName: 'Memos',
	viewIcon: 'pencil',
	autoAddToDailyNote: true,
	dailyNoteTemplate: '# {{date}}\n\n## 📝 备忘录\n\n## 📅 今日计划\n\n## 🎯 完成事项\n\n## 💭 思考记录\n\n',
	memoSectionHeaders: ['## 📝 备忘录', '## Memos', '## 备忘录'],
	notifications: {
		memoSaved: '备忘录已保存',
		saveFailed: '保存备忘录失败，请重试',
		editorNotInitialized: '编辑器未初始化',
		pleaseEnterContent: '请输入备忘录内容',
		addToDailyNoteFailed: '添加到日记失败'
	}
};

/**
 * 设置验证结果接口
 */
export interface ValidationResult {
	/** 是否有效 */
	isValid: boolean;
	/** 错误消息 */
	errorMessage?: string;
	/** 修正后的值 */
	correctedValue?: any;
}

/**
 * 验证目录路径
 * @param path 目录路径
 * @returns 验证结果
 */
export function validateDirectoryPath(path: string): ValidationResult {
	if (!path || path.trim().length === 0) {
		return {
			isValid: false,
			errorMessage: 'Directory path cannot be empty',
			correctedValue: 'Memos'
		};
	}
	
	// 检查是否包含非法字符
	const invalidChars = /[<>:"|?*]/;
	if (invalidChars.test(path)) {
		return {
			isValid: false,
			errorMessage: 'Directory path contains invalid characters',
			correctedValue: path.replace(invalidChars, '')
		};
	}
	
	return { isValid: true };
}

/**
 * 验证日期格式字符串（已弃用 - 使用 Obsidian 内置的 addMomentFormat 验证）
 * @deprecated 使用 Obsidian 的 addMomentFormat 方法，它内置了验证功能
 * @param format 日期格式字符串
 * @returns 验证结果
 */
export function validateDateFormat(format: string): ValidationResult {
	// 简化验证，因为 addMomentFormat 已经处理了验证
	if (!format || format.trim() === '') {
		return {
			isValid: false,
			errorMessage: 'Date format cannot be empty',
			correctedValue: 'YYYY-MM-DD'
		};
	}

	return { isValid: true };
}

/**
 * 验证图标名称
 * @param iconName 图标名称
 * @returns 验证结果
 */
export function validateIconName(iconName: string): ValidationResult {
	if (!iconName || iconName.trim().length === 0) {
		return {
			isValid: false,
			errorMessage: 'Icon name cannot be empty',
			correctedValue: 'pencil'
		};
	}
	
	// 检查是否只包含字母、数字和连字符
	const validIconName = /^[a-z0-9-]+$/.test(iconName);
	if (!validIconName) {
		return {
			isValid: false,
			errorMessage: 'Icon name should only contain lowercase letters, numbers, and hyphens',
			correctedValue: iconName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
		};
	}
	
	return { isValid: true };
}

/**
 * 验证备忘录部分标题
 * @param headers 标题数组
 * @returns 验证结果
 */
export function validateMemoSectionHeaders(headers: string[]): ValidationResult {
	if (!headers || headers.length === 0) {
		return {
			isValid: false,
			errorMessage: 'At least one memo section header is required',
			correctedValue: ['## 📝 Memos', '## Memos', '## 备忘录']
		};
	}
	
	// 过滤空字符串
	const validHeaders = headers.filter(h => h && h.trim().length > 0);
	if (validHeaders.length === 0) {
		return {
			isValid: false,
			errorMessage: 'At least one valid memo section header is required',
			correctedValue: ['## 📝 Memos', '## Memos', '## 备忘录']
		};
	}
	
	return { 
		isValid: true,
		correctedValue: validHeaders
	};
}

/**
 * 验证完整的设置对象
 * @param settings 设置对象
 * @returns 验证结果和修正后的设置
 */
export function validateSettings(settings: Partial<MemoPluginSettings>): {
	isValid: boolean;
	errors: string[];
	correctedSettings: Partial<MemoPluginSettings>;
} {
	const errors: string[] = [];
	const correctedSettings: Partial<MemoPluginSettings> = { ...settings };
	
	// 验证目录路径
	if (settings.memosDirectory !== undefined) {
		const result = validateDirectoryPath(settings.memosDirectory);
		if (!result.isValid) {
			errors.push(`Memo directory: ${result.errorMessage}`);
			correctedSettings.memosDirectory = result.correctedValue;
		}
	}
	
	if (settings.dailyNoteDirectory !== undefined) {
		const result = validateDirectoryPath(settings.dailyNoteDirectory);
		if (!result.isValid) {
			errors.push(`Daily note directory: ${result.errorMessage}`);
			correctedSettings.dailyNoteDirectory = result.correctedValue;
		}
	}
	
	// 验证日期格式
	if (settings.dailyNoteDateFormat !== undefined) {
		const result = validateDateFormat(settings.dailyNoteDateFormat);
		if (!result.isValid) {
			errors.push(`Daily note date format: ${result.errorMessage}`);
			correctedSettings.dailyNoteDateFormat = result.correctedValue;
		}
	}
	
	if (settings.timestampFormat !== undefined) {
		const result = validateDateFormat(settings.timestampFormat);
		if (!result.isValid) {
			errors.push(`Timestamp format: ${result.errorMessage}`);
			correctedSettings.timestampFormat = result.correctedValue;
		}
	}
	
	// 验证图标名称
	if (settings.viewIcon !== undefined) {
		const result = validateIconName(settings.viewIcon);
		if (!result.isValid) {
			errors.push(`View icon: ${result.errorMessage}`);
			correctedSettings.viewIcon = result.correctedValue;
		}
	}
	
	// 验证备忘录部分标题
	if (settings.memoSectionHeaders !== undefined) {
		const result = validateMemoSectionHeaders(settings.memoSectionHeaders);
		if (!result.isValid) {
			errors.push(`Memo section headers: ${result.errorMessage}`);
			correctedSettings.memoSectionHeaders = result.correctedValue;
		}
	}
	
	return {
		isValid: errors.length === 0,
		errors,
		correctedSettings
	};
}

/**
 * 深度合并设置对象，确保嵌套属性正确复制
 * @param defaults 默认设置
 * @param loaded 从磁盘加载的设置
 * @returns 合并后的完整设置对象
 */
export function mergeSettings(
	defaults: Partial<MemoPluginSettings>,
	loaded: Partial<MemoPluginSettings>
): MemoPluginSettings {
	// 首先验证加载的设置
	const validation = validateSettings(loaded);
	const validatedLoaded = validation.correctedSettings;
	
	const result = { ...defaults } as MemoPluginSettings;
	
	// 深度合并嵌套对象
	if (validatedLoaded.notifications && defaults.notifications) {
		result.notifications = {
			...defaults.notifications,
			...validatedLoaded.notifications
		};
	}
	
	// 合并数组属性
	if (validatedLoaded.memoSectionHeaders) {
		result.memoSectionHeaders = [...validatedLoaded.memoSectionHeaders];
	}
	
	// 合并其他属性
	Object.keys(validatedLoaded).forEach(key => {
		if (key !== 'notifications' && key !== 'memoSectionHeaders') {
			(result as any)[key] = validatedLoaded[key as keyof MemoPluginSettings];
		}
	});
	
	return result;
}