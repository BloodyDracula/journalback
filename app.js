require('dotenv').config();
const express = require('express');
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const subjectRoutes = require('./routes/subject');
const gradeRoutes = require('./routes/grade');

const app = express();

app.use(loggerMiddleware);

app.use(cors({
    origin: '*', // Разрешаем запросы с этого домена
    credentials: true, // Разрешаем передачу куки и заголовков авторизации
}));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/subjects', subjectRoutes);
app.use('/grades', gradeRoutes);

db.sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});