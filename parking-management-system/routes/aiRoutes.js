const express = require('express');
const multer = require('multer');
const { PythonShell } = require('python-shell');
const path = require('path');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/detect', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const outputPath = path.join(__dirname, '../ai_model/output.jpg');

  const options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname, '../ai_model'),
    args: [imagePath]
  };

  PythonShell.run('yolov8_model.py', options, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.sendFile(outputPath);
  });
});

router.get('/video', (req, res) => {
  const options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'],
    scriptPath: path.join(__dirname, '../ai_model')
  };

  PythonShell.run('video_processing.py', options, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Video processing started' });
  });
});

module.exports = router;
