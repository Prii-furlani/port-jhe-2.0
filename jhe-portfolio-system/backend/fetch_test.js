const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, role: 'admin_master', nome: 'Test' }, 'jhe_super_secret_key_2026');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let postData = '';
const formData = {
    titulo: 'Test Project',
    cliente_id: '1',
    servico_id: '',
    setor: '',
    resumo_curto: '',
    descricao_detalhada: '',
    desafios: '',
    metodologias: '',
    link_oficial: '',
    ano_desenvolvimento: '2024',
    stakeholders: '[]',
    tecnologias: '[]',
    status_solicitado: 'active'
};

for (const key in formData) {
    postData += `--${boundary}\r\n`;
    postData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    postData += `${formData[key]}\r\n`;
}
postData += `--${boundary}--\r\n`;

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/projects/1',
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', e => console.error('Error:', e));
req.write(postData);
req.end();
