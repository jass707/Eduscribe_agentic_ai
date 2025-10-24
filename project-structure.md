# EduScribe Project Structure

## Recommended Folder Structure

```
eduscribe/
├── frontend/           # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── backend/            # Python/Node.js backend API
│   ├── src/
│   ├── requirements.txt (Python) or package.json (Node.js)
│   └── ...
├── shared/             # Shared utilities, types, constants
├── docs/               # Documentation
└── README.md           # Main project README
```

## Current Status

The frontend is currently in `d:\store\notify\` and is ready to run.
You can either:
1. Move the current frontend to a `frontend/` subfolder
2. Create the backend in a separate `backend/` folder
3. Keep them as separate repositories

## Next Steps

1. Decide on the final folder structure
2. Move files accordingly
3. Update package.json scripts if needed
4. Set up the backend structure
