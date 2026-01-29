/**
 * 存储服务抽象接口
 * 支持未来切换到不同的云存储服务（七牛云、阿里云OSS等）
 */
export interface StorageService {
  /**
   * 上传照片
   * @param file 文件对象
   * @param userId 用户ID（用于创建用户专属目录）
   * @returns 照片的公开访问URL
   */
  uploadPhoto(file: File, userId: string): Promise<string>

  /**
   * 删除照片
   * @param photoUrl 照片URL
   */
  deletePhoto(photoUrl: string): Promise<void>
}

/**
 * Supabase 存储实现
 */
export class SupabaseStorageService implements StorageService {
  constructor(private supabaseUrl: string, private supabaseKey: string) {}

  async uploadPhoto(file: File, userId: string): Promise<string> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('event-photos')
      .upload(fileName, file)

    if (error) {
      throw new Error(`上传失败: ${error.message}`)
    }

    // 返回公开访问URL
    const { data: urlData } = supabase.storage
      .from('event-photos')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // 从URL中提取文件路径
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts.slice(-2).join('/')

    const { error } = await supabase.storage
      .from('event-photos')
      .remove([fileName])

    if (error) {
      throw new Error(`删除失败: ${error.message}`)
    }
  }
}

/**
 * 七牛云存储实现（示例，未来可以切换）
 */
export class QiniuStorageService implements StorageService {
  constructor(
    private accessKey: string,
    private secretKey: string,
    private bucket: string,
    private domain: string
  ) {}

  async uploadPhoto(file: File, userId: string): Promise<string> {
    // TODO: 实现七牛云上传逻辑
    // 这里只是示例代码结构
    throw new Error('七牛云存储暂未实现')
  }

  async deletePhoto(photoUrl: string): Promise<void> {
    // TODO: 实现七牛云删除逻辑
    throw new Error('七牛云存储暂未实现')
  }
}

/**
 * 获取当前使用的存储服务
 * 通过修改这里的返回值，可以轻松切换存储服务
 */
export function getStorageService(): StorageService {
  // 目前使用 Supabase
  return new SupabaseStorageService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 未来切换到七牛云，只需要修改这里：
  // return new QiniuStorageService(
  //   process.env.QINIU_ACCESS_KEY!,
  //   process.env.QINIU_SECRET_KEY!,
  //   process.env.QINIU_BUCKET!,
  //   process.env.QINIU_DOMAIN!
  // )
}
