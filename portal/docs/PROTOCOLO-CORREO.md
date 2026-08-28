# Protocolo de correo

> Runbook operativo del envío de correo del portal.
> Se consulta cuando algo no llegó, y antes de cada evento.

## Por qué existe este documento

El correo del portal no se caía. **Se callaba.** El código decía:

```ts
if (!process.env.RESEND_API_KEY || !assignedEmail) return
```

Sin llave, sin destinatario, o con un fallo de la API, la función se salía en
silencio: sin log, sin error, sin registro. Nadie se enteraba nunca. De ahí la
sensación de que "se desconecta": no se desconectaba, es que nada avisaba.

Este protocolo existe para que eso no vuelva a pasar. La regla que lo gobierna:

> **Ningún envío falla en silencio, y la alerta de que el correo falló nunca
> viaja por correo.**

---

## 1. Qué manda correo, hoy

Tres caminos, y no van por el mismo lugar. Esa es la confusión que más tiempo
nos costó.

| Qué | Por dónde sale | Dónde se configura |
|---|---|---|
| Invitación a un participante | Mailer de Supabase Auth | **Supabase**, SMTP |
| Recuperar contraseña | Mailer de Supabase Auth | **Supabase**, SMTP |
| Confirmación de firma | API de Resend, desde el portal | **Vercel**, variables |

**Son dos configuraciones distintas de Resend, en dos paneles distintos.**
Tener una no implica tener la otra. Casi todos los sustos vienen de creer que sí.

---

## 2. Los números, y por qué no hay que preocuparse

Plan gratuito de Resend: **3.000 correos al mes, con tope de 100 al día.**

Volumen real de un evento de Trascendencia, con doce familias y unas
veinticuatro personas: **entre 100 y 200 correos repartidos en seis semanas.**

Eso da margen para quince o veinte eventos al mes. Se hacen unos cuantos al año.

**El único límite que puede morder es el de 100 al día**, y solo si se manda
todo de golpe. Por eso el código escalona los envíos masivos (sección 4).

Si algún día se pasa: el plan Pro son 20 USD al mes por 50.000. Deja de ser un
problema de dinero y es solo de visibilidad.

---

## 3. Infraestructura: lo que hace Francisco

Una sola vez, y después no se toca.

### 3.1 Decidir el dominio que manda

Hoy el código cae por defecto en `noreply@trascendencia.mx`. El sitio de marca
vive en `4meaning.life`. **Hay que elegir uno y que sea el mismo en los dos
paneles.** Un evento no puede mandar invitaciones desde un dominio y
confirmaciones desde otro: se ve mal y castiga la entregabilidad.

### 3.2 Verificar el dominio en Resend

En Resend, agregar el dominio y publicar los registros de DNS que pida, que son
de SPF y DKIM. **Sin dominio verificado, la mayoría de las plataformas solo
dejan mandar correos a tu propia dirección**, y eso explica buena parte de los
envíos que parecían perderse.

Conviene agregar también un registro DMARC. No es obligatorio para enviar, pero
es lo que evita que con el tiempo los correos se vayan a spam.

**Si algún día se cambia de proveedor de DNS, estos registros se mudan con él.**
Es la causa número uno de que un correo que funcionaba deje de funcionar.

### 3.3 Las variables en Vercel

Proyecto `trascendencia-portal`:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`, con el dominio verificado en 3.2

**En los tres entornos: Production, Preview y Development.** Hoy las siete
variables que existen están casi todas solo en Production, y de ahí salen la
mitad de los sustos: funciona en producción y falla en cualquier preview, sin
que nada lo diga.

### 3.4 El SMTP en Supabase

En Supabase, Authentication, SMTP Settings: apuntar a Resend con el mismo
dominio. Eso quita el límite de unos pocos correos por hora del mailer propio de
Supabase, que es lo que rompe las invitaciones cuando se invita a un capítulo
entero de golpe.

### 3.5 Al rotar la llave

Si se rota o se borra la llave de API en Resend, hay que actualizarla **en los
dos lugares**: Vercel y Supabase. El semáforo de la sección 5 lo va a marcar en
rojo en cuanto pase, pero más vale saberlo de antemano.

---

## 4. Código: lo que se construye del lado del portal

Ninguna de estas piezas existe todavía. Van en este orden.

### 4.1 Que grite en vez de callarse

Quitar el `return` mudo. Si falta la llave o el envío falla, se registra el
motivo y se propaga. Un correo que no salió es un hecho operativo, no un detalle.

### 4.2 La bitácora

Tabla `email_log`, con RLS y visible solo para el equipo:

| Campo | Para qué |
|---|---|
| `to` | A quién |
| `tipo` | Invitación, firma, convocatoria, aviso |
| `asunto` | Qué decía |
| `estado` | Encolado, aceptado, entregado, rebotado, quejado, fallido |
| `provider_id` | El id que devuelve Resend, para rastrear del otro lado |
| `error` | El motivo textual cuando falla |
| `event_id` | Para poder ver un evento completo |
| `created_at` | Cuándo |

Con esto se deja de adivinar. La pregunta "¿le llegó a Fulano?" pasa a tener
respuesta.

### 4.3 Los webhooks de Resend

Resend avisa cuando un correo se entrega, rebota o lo marcan como spam. Una ruta
que reciba esos avisos y actualice el `estado` de la bitácora.

Sin esto, la bitácora solo dice **que se aceptó el envío**, que no es lo mismo
que decir que llegó.

### 4.4 Escalonar y encolar

Nunca mandar más de un puñado por minuto. Si un envío masivo se acerca al tope
diario, lo que sobra se encola y sale al día siguiente. **Un correo demorado es
un inconveniente. Un correo perdido es una familia que no se enteró.**

### 4.5 Lista de supresión

Si una dirección rebota en duro, se deja de escribir ahí y se marca en el admin,
para que alguien pida la dirección buena. Seguir escribiendo a una dirección
muerta castiga la reputación del dominio entero.

### 4.6 El semáforo

Una tarjeta en el admin que **le pregunte a Resend de verdad** si la llave sirve
y si el dominio está verificado. No que compruebe que la variable existe: eso es
lo que nos tuvo semanas creyendo que estaba bien.

Y al lado, el contador del mes contra el tope de 3.000.

### 4.7 La alerta, y por dónde viaja

Cuando un envío falla, o cuando el semáforo se pone en rojo, **la alerta llega
por notificación push al teléfono del equipo, no por correo.**

Avisar por correo que el correo está caído es el error clásico. El portal ya
tiene push funcionando con `web-push`, así que el canal ya está.

---

## 5. Antes de cada evento

Lista corta, dos minutos.

- [ ] El semáforo del admin está en verde.
- [ ] El contador del mes tiene margen para el evento que viene.
- [ ] No hay direcciones en la lista de supresión de las familias convocadas.
- [ ] Se mandó un correo de prueba a una dirección real y llegó a bandeja de
      entrada, no a spam.

---

## 6. Cuando algo no llegó

En este orden, sin saltarse pasos.

1. **Buscar en la bitácora.** Si no hay registro, el portal nunca lo intentó, y
   el problema es del disparador, no del correo.
2. **Si hay registro y dice fallido**, el motivo está en `error`.
3. **Si dice aceptado pero no entregado**, es del lado del destinatario: revisar
   spam, y si rebotó, la dirección está mal.
4. **Si el semáforo está rojo**, es la llave o el dominio. Sección 3.
5. **Si nada de lo anterior**, revisar el panel de Resend directamente.

---

## 7. Lo que este protocolo NO resuelve

Dicho para que nadie prometa lo que no hay.

- **El correo nunca es garantía de llegada.** Ni con todo esto. Para lo crítico,
  el canal es el push, o la persona.
- **No sustituye el primer contacto.** No se le puede mandar push a alguien que
  nunca ha abierto la app, así que la credencial inicial se entrega por
  WhatsApp o en mano.
- **En iPhone el push solo funciona si la app está agregada a la pantalla de
  inicio.** Eso hace que la instalación guiada sea parte del protocolo de
  convocatoria, no un detalle técnico.
