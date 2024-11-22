const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webPush = require('web-push');
const Subscription  = require('./models/Subscription');
require('dotenv').config(); // Cargar variables de entorno desde .env

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
    origin: "http://adictosalcine.com", // Cambia por el dominio de tu frontend
    credentials: true,
}));

app.use(bodyParser.json());

// Claves VAPID (debes generarlas una vez)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY; // Leer la clave pública del .env
const privateVapidKey = process.env.VAPID_PRIVATE_KEY; // Leer la clave privada del .env

webPush.setVapidDetails(
    'mailto:developer@example.com',
    publicVapidKey,
    privateVapidKey
);

// Ruta para guardar suscripciones
app.post('/subscribe', async (req, res) => {
    const {/* userId,*/ subscription } = req.body;

    try {

        // Buscar si el endpoint ya existe
        const existingSubscription = await Subscription.findOne({
            where: { endpoint: subscription.endpoint },
        });

        if (existingSubscription) {
            // Opcional: Actualizar los datos existentes
            await existingSubscription.update({
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            });

            return res.status(200).json({ message: 'Suscripción ya registrada, datos actualizados' });
        }

        await Subscription.create({
           // userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        });
        res.status(201).json({ message: 'Suscripción guardada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar la suscripción' });
    }
});

// Ruta para enviar notificaciones
app.post('/notify', async (req, res) => {
    const { title, message, url } = req.body;

    // Validar los datos del cuerpo de la solicitud
    if (!title || !message || !url) {
        return res.status(400).json({ message: 'Faltan datos: title, message o url' });
    }

    try {
        // Obtener todas las suscripciones
        const subscriptions = await Subscription.findAll();

        // Iterar sobre las suscripciones y enviar la notificación a cada una
        subscriptions.forEach(({ endpoint, p256dh, auth }) => {
            const payload = JSON.stringify({
                title: title, // Título de la notificación
                body: message, // Mensaje principal de la notificación
                url: url, // Enlace que la notificación debe abrir
            });

            webPush.sendNotification(
                {
                    endpoint,
                    keys: { p256dh, auth },
                },
                payload
            ).catch(error => {
                console.error(`Error al enviar notificación a ${endpoint}:`, error);
            });
        });

        res.status(200).json({ message: 'Notificaciones enviadas' });
    } catch (error) {
        console.error('Error al enviar notificaciones:', error);
        res.status(500).json({ message: 'Error al enviar las notificaciones', error: error.message });
    }
});


app.post('/isRegistered', async (req, res) => {
    const { endpoint } = req.body;

    try {
        if (!endpoint) {
            return res.status(400).json({ message: 'El endpoint es requerido' });
        }

        // Busca si el endpoint existe
        const existingSubscription = await Subscription.findOne({
            where: { endpoint },
        });

        if (existingSubscription) {
            return res.status(200).json({ registered: true, message: 'Usuario registrado' });
        }

        return res.status(200).json({ registered: false, message: 'Usuario no registrado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar la suscripción' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
