import { Album, AlbumPage, Photo } from '../types/album';

class ExportService {
  /**
   * Triggers browser print dialog for printing album as PDF or saving to PDF file
   */
  async exportToPDF(album: Album, pages: AlbumPage[], photos: Photo[]): Promise<void> {
    window.print();
  }

  /**
   * Captures current active album page as high quality image file and triggers browser download
   */
  async exportPageAsImage(albumTitle: string, pageNum: number): Promise<void> {
    const pageElement = document.getElementById('printable-album-page');
    if (!pageElement) return;

    // Use HTML5 Canvas to capture the page content
    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${pageElement.clientWidth}" height="${pageElement.clientHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${pageElement.innerHTML}
        </div>
      </foreignObject>
    </svg>`;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pageElement.clientWidth;
      canvas.height = pageElement.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const a = document.createElement('a');
        a.download = `${albumTitle}-Страница-${pageNum}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
}

export const exportService = new ExportService();
