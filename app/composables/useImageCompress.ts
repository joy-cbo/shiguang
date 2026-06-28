/**
 * 图片压缩工具 — 客户端压缩图片后再上传
 * 
 * 使用 Canvas API 进行压缩，支持 JPEG、PNG、WebP 格式
 */

interface CompressOptions {
  maxWidth?: number      // 最大宽度，默认 1920
  maxHeight?: number     // 最大高度，默认 1080
  quality?: number       // 压缩质量 0-1，默认 0.8
  format?: 'jpeg' | 'png' | 'webp'  // 输出格式，默认 jpeg
}

/**
 * 压缩图片文件
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩后的 Blob
 */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('不是图片文件'))
      return
    }

    // 如果文件小于 500KB，不压缩
    if (file.size < 500 * 1024) {
      resolve(file)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建 canvas context'))
      return
    }

    const img = new Image()

    img.onload = () => {
      // 计算新尺寸
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }

      // 设置 canvas 尺寸
      canvas.width = width
      canvas.height = height

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为 Blob
      const mimeType = `image/${format}`
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片压缩失败'))
          }
        },
        mimeType,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    // 加载图片
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 压缩图片并返回 File 对象
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩后的 File
 */
export async function compressImageToFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const blob = await compressImage(file, options)
  const ext = options.format || 'jpeg'
  const name = file.name.replace(/\.[^/.]+$/, '') + `_compressed.${ext}`
  return new File([blob], name, { type: `image/${ext}` })
}

/**
 * 生成缩略图
 * @param file 图片文件
 * @param size 缩略图尺寸（正方形）
 * @returns 缩略图 Blob
 */
export function generateThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  })
}
