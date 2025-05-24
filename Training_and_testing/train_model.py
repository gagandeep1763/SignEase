import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization, LSTM, TimeDistributed
from tensorflow.keras.layers import GlobalAveragePooling2D, Conv2D, MaxPooling2D
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import glob

# Paths and hyperparameters
data_dir = "D:/DGM/Dhanush/Sign_language/Video_frames_creator/ISL/Dataset_with_Landmarks"
img_size = (128, 128)
batch_size = 16
epochs = 50
sequence_length = 10  # Number of frames per word

def load_sequence_data(data_dir, batch_size, sequence_length, img_size, is_training=True):
    # Get all word directories and their labels
    word_dirs = []
    for letter in os.listdir(data_dir):
        letter_path = os.path.join(data_dir, letter)
        if os.path.isdir(letter_path):
            for word in os.listdir(letter_path):
                word_path = os.path.join(letter_path, word)
                if os.path.isdir(word_path):
                    word_dirs.append((word_path, letter))
    
    word_dirs = np.array(word_dirs, dtype=object)
    num_classes = len(set([d[1] for d in word_dirs]))
    
    while True:
        # Select random batch of word directories
        batch_indices = np.random.choice(len(word_dirs), batch_size, replace=False)
        batch_dirs = word_dirs[batch_indices]
        
        # Initialize batch arrays
        batch_sequences = np.zeros((batch_size, sequence_length, *img_size, 3))
        batch_labels = np.zeros((batch_size, num_classes))
        
        for i, (word_dir, label) in enumerate(batch_dirs):
            # Get all frames for this word
            frames = sorted(glob.glob(os.path.join(word_dir, "*.jpg")))
            
            if len(frames) < sequence_length:
                # Pad with last frame if not enough frames
                frames = frames + [frames[-1]] * (sequence_length - len(frames))
            else:
                # Take evenly spaced frames if too many
                indices = np.linspace(0, len(frames)-1, sequence_length, dtype=int)
                frames = [frames[i] for i in indices]
            
            # Load and preprocess frames
            for j, frame_path in enumerate(frames):
                img = tf.keras.preprocessing.image.load_img(
                    frame_path, target_size=img_size
                )
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                img_array = img_array / 255.0  # Normalize
                
                if is_training:
                    # Apply augmentation
                    img_array = tf.image.random_flip_left_right(img_array)
                    img_array = tf.image.random_brightness(img_array, 0.2)
                    img_array = tf.image.random_contrast(img_array, 0.8, 1.2)
                    img_array = tf.image.random_saturation(img_array, 0.8, 1.2)
                
                batch_sequences[i, j] = img_array
            
            # One-hot encode the label
            label_index = list(set([d[1] for d in word_dirs])).index(label)
            batch_labels[i, label_index] = 1
        
        yield batch_sequences, batch_labels

# Create data generators
train_generator = load_sequence_data(
    data_dir, 
    batch_size=batch_size,
    sequence_length=sequence_length,
    img_size=img_size,
    is_training=True
)

val_generator = load_sequence_data(
    data_dir,
    batch_size=batch_size,
    sequence_length=sequence_length,
    img_size=img_size,
    is_training=False
)

# Create the model
def create_model(num_classes):
    # Base CNN (MobileNetV2)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(*img_size, 3)
    )
    
    # Freeze the base model layers
    base_model.trainable = False
    
    # Create the model
    inputs = Input(shape=(sequence_length, *img_size, 3))
    
    # Process each frame through the CNN
    x = TimeDistributed(base_model)(inputs)
    x = TimeDistributed(GlobalAveragePooling2D())(x)
    
    # LSTM layers for sequence processing
    x = LSTM(256, return_sequences=True)(x)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    x = LSTM(128)(x)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    # Dense layers
    x = Dense(512, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.5)(x)
    
    outputs = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=inputs, outputs=outputs)
    return model

# Get number of classes
num_classes = len(set([d[1] for d in [(os.path.join(data_dir, letter, word), letter) 
                                    for letter in os.listdir(data_dir) 
                                    for word in os.listdir(os.path.join(data_dir, letter)) 
                                    if os.path.isdir(os.path.join(data_dir, letter, word))]]))

# Create and compile the model
model = create_model(num_classes)

# Use a custom learning rate with warmup
initial_learning_rate = 0.001
lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
    initial_learning_rate,
    decay_steps=1000,
    decay_rate=0.9,
    staircase=True
)

optimizer = Adam(learning_rate=lr_schedule)

# Compile the model with label smoothing
model.compile(
    optimizer=optimizer,
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=['accuracy']
)

# Callbacks
callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=5,
        min_lr=1e-6
    ),
    ModelCheckpoint(
        'best_model.keras',
        monitor='val_accuracy',
        save_best_only=True
    )
]

# Calculate steps per epoch
total_words = sum([len(os.listdir(os.path.join(data_dir, letter))) 
                  for letter in os.listdir(data_dir) 
                  if os.path.isdir(os.path.join(data_dir, letter))])
steps_per_epoch = total_words // batch_size
validation_steps = steps_per_epoch // 5  # 20% of training steps

# Train the model
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=epochs,
    steps_per_epoch=steps_per_epoch,
    validation_steps=validation_steps,
    callbacks=callbacks
)

# Save the final model
model.save("isl_sign_model_final.keras")

# Print training history
print("\nTraining completed!")
print(f"Best validation accuracy: {max(history.history['val_accuracy'])}")

# Plot training history
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 4))

# Plot accuracy
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

# Plot loss
plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.savefig('training_history.png')
plt.close()
