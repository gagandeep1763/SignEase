// Service for handling gesture recognition from images
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const gestureService = {
  // Test backend connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_URL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  },

  // Function to predict gesture from an image file
  predictFromFile: async (file) => {
    try {
      console.log('Starting prediction for file:', file.name);
      
      // Test backend connection first
      const isConnected = await gestureService.testConnection();
      if (!isConnected) {
        throw new Error('Backend server is not responding. Please ensure it is running on port 5000.');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file');
      }

      // Create FormData to send the image
      console.log('Sending request to backend...');
      const formData = new FormData();
      formData.append('file', file);

      // Make API call to backend service
      console.log('Sending request to backend...');
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('Received response:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || 'Failed to get prediction from server');
      }

      if (!data.prediction) {
        throw new Error('No prediction received from server');
      }

      console.log('Prediction result:', data);
      return {
        gesture: data.prediction,
        confidence: data.confidence || 0
      };
    } catch (error) {
      console.error('Error in gesture prediction:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not connect to the server. Please ensure the backend is running on port 5000 and CORS is enabled.');
      }
      throw new Error(error.message || 'Failed to process image. Please try again.');
    }
  }
}; 