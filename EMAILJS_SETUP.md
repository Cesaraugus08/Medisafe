# Configuración de EmailJS para Envío de Emails Reales

## 📧 ¿Qué es EmailJS?

EmailJS es un servicio gratuito que permite enviar emails desde JavaScript sin necesidad de un servidor backend. Es perfecto para aplicaciones frontend como MediSafe.

## 🚀 Pasos para Configurar EmailJS

### 1. Registrarse en EmailJS
1. Ve a [https://emailjs.com](https://emailjs.com)
2. Haz clic en "Sign Up" y crea una cuenta gratuita
3. Confirma tu email

### 2. Obtener tu User ID
1. Una vez registrado, ve a tu Dashboard
2. En la sección "Account" encontrarás tu **User ID**
3. Copia este ID (ejemplo: `user_abc123def456`)

### 3. Configurar un Servicio de Email
1. En tu Dashboard, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado)
   - **Outlook**
   - **Yahoo**
   - **Otros**
4. Sigue las instrucciones para conectar tu cuenta
5. Copia el **Service ID** generado

### 4. Crear una Plantilla de Email
1. Ve a "Email Templates"
2. Haz clic en "Create New Template"
3. Usa este código HTML como plantilla:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Código de Verificación - MediSafe</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8f9fa; }
        .code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; padding: 20px; background-color: white; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Verificación</h1>
            <p>MediSafe - Control de Medicamentos</p>
        </div>
        
        <div class="content">
            <h2>Hola {{user_name}},</h2>
            
            <p>Has solicitado restablecer tu contraseña en MediSafe.</p>
            
            <p>Tu código de verificación es:</p>
            
            <div class="code">
                {{verification_code}}
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Este código expira en 5 minutos</li>
                <li>No compartas este código con nadie</li>
                <li>Si no solicitaste este código, ignora este email</li>
            </ul>
            
            <p>Si tienes problemas, contacta al soporte técnico.</p>
        </div>
        
        <div class="footer">
            <p>Este email fue enviado desde MediSafe el {{current_date}}</p>
            <p>© 2024 MediSafe - Control de Medicamentos</p>
        </div>
    </div>
</body>
</html>
```

4. Guarda la plantilla y copia el **Template ID**

### 5. Configurar las Credenciales en MediSafe

1. Abre el archivo `emailjs-config.js`
2. Reemplaza las credenciales con tus datos reales:

```javascript
const EMAILJS_CONFIG = {
  USER_ID: "tu_user_id_aqui",
  SERVICE_ID: "tu_service_id_aqui", 
  TEMPLATE_ID: "tu_template_id_aqui"
};
```

### 6. Probar el Envío

1. Abre MediSafe en tu navegador
2. Ve a "¿Olvidaste tu contraseña?"
3. Selecciona "Email"
4. Ingresa tu email
5. Haz clic en "Enviar código"
6. Revisa tu bandeja de entrada

## 🔧 Variables Disponibles en la Plantilla

- `{{to_email}}` - Email del destinatario
- `{{verification_code}}` - Código de 6 dígitos
- `{{user_name}}` - Nombre del usuario (parte antes del @)
- `{{app_name}}` - Nombre de la aplicación (MediSafe)
- `{{reset_link}}` - URL de la aplicación
- `{{current_date}}` - Fecha actual

## ⚠️ Notas Importantes

1. **Plan Gratuito**: EmailJS permite 200 emails por mes gratis
2. **Límites**: No más de 200 emails por mes en el plan gratuito
3. **Seguridad**: Los emails se envían desde tu cuenta de email configurada
4. **Fallback**: Si EmailJS falla, el código se muestra en pantalla

## 🆘 Solución de Problemas

### Error: "EmailJS no configurado"
- Verifica que las credenciales estén correctas en `emailjs-config.js`
- Asegúrate de que el archivo `emailjs-config.js` esté incluido en `index.html`

### Error: "Service not found"
- Verifica que el Service ID sea correcto
- Asegúrate de que el servicio de email esté activo en EmailJS

### Error: "Template not found"
- Verifica que el Template ID sea correcto
- Asegúrate de que la plantilla esté guardada y activa

### Los emails no llegan
- Revisa la carpeta de spam
- Verifica que el email esté bien escrito
- Revisa los logs en la consola del navegador

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa la documentación de EmailJS
2. Verifica que todas las credenciales sean correctas
3. Revisa la consola del navegador para errores
4. Contacta al soporte técnico si persisten los problemas 