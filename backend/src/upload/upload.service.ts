import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadPath: string;

  constructor(private config: ConfigService) {
    this.uploadPath = this.config.get('UPLOAD_PATH') || './uploads';
    this.ensureUploadDirExists();
  }

  /**
   * Garante que o diretório de uploads existe
   */
  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      console.log(`✅ Diretório de uploads criado: ${this.uploadPath}`);
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadPath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  fileExists(filePath: string): boolean {
    const fullPath = path.join(this.uploadPath, filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Obtém informações de um arquivo
   */
  getFileStats(filePath: string) {
    const fullPath = path.join(this.uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath);
    }
    return null;
  }
}
