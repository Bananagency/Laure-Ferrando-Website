<template>
  <div class="masonry-container">
    <div class="masonry-grid">
      <div class="masonry-item" v-for="(image, index) in images" :key="index" :class="`item-${(index % 4) + 1}`" @click="openModal(index)">
        <img :src="image.url" :alt="image.alt" loading="lazy" />
        <div class="overlay">
          <div class="overlay-content">
            <h3>{{ image.title }}</h3>
            <p>{{ truncateDescription(image.description) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <span class="modal-close" @click="closeModal">&times;</span>
        <button class="modal-nav modal-prev" @click="showPrevImage" aria-label="Image précédente">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button class="modal-nav modal-next" @click="showNextImage" aria-label="Image suivante">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
        <div class="modal-layout">
          <div class="modal-image-container">
            <img :src="currentImage.url" :alt="currentImage.alt" />
          </div>
          <div class="modal-info">
            <h3>{{ currentImage.title }}</h3>
            <p v-if="currentImage.description" class="modal-description">{{ currentImage.description }}</p>
            <span class="modal-counter">{{ currentImageIndex + 1 }} / {{ images.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showModal: false,
      currentImageIndex: 0
    };
  },
  computed: {
    currentImage() {
      return this.images[this.currentImageIndex] || {};
    }
  },
  mounted() {
    this.initMasonry();
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    initMasonry() {
      // Animation d'apparition progressive
      const items = document.querySelectorAll('.masonry-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 100);
      });
    },
    handleResize() {
      // Réajustement si nécessaire
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.initMasonry();
      }, 250);
    },
    openModal(index) {
      this.currentImageIndex = index;
      this.showModal = true;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.showModal = false;
      document.body.style.overflow = 'auto';
    },
    showPrevImage() {
      this.currentImageIndex = this.currentImageIndex > 0 
        ? this.currentImageIndex - 1 
        : this.images.length - 1;
    },
    showNextImage() {
      this.currentImageIndex = this.currentImageIndex < this.images.length - 1 
        ? this.currentImageIndex + 1 
        : 0;
    },
    handleKeydown(e) {
      if (this.showModal) {
        switch (e.key) {
          case 'Escape':
            this.closeModal();
            break;
          case 'ArrowLeft':
            this.showPrevImage();
            break;
          case 'ArrowRight':
            this.showNextImage();
            break;
        }
      }
    },
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 80 ? description.substring(0, 80) + '...' : description;
    }
  }
};
</script>

<style lang="scss" scoped>
.masonry-container {
  width: 100%;
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 1rem;
  grid-auto-rows: 15px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 0.8rem;
    grid-auto-rows: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0.8rem;
  }
}

.masonry-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
  transform: translateY(30px);
  cursor: pointer;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);

    .overlay {
      opacity: 1;
    }

    img {
      transform: scale(1.05);
    }
  }

  // Hauteurs variables pour l'effet maçonnerie (réduites)
  &.item-1 {
    grid-row-end: span 18;

    @media (max-width: 768px) {
      grid-row-end: span 16;
    }
  }

  &.item-2 {
    grid-row-end: span 15;

    @media (max-width: 768px) {
      grid-row-end: span 13;
    }
  }

  &.item-3 {
    grid-row-end: span 22;

    @media (max-width: 768px) {
      grid-row-end: span 19;
    }
  }

  &.item-4 {
    grid-row-end: span 16;

    @media (max-width: 768px) {
      grid-row-end: span 14;
    }
  }
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
}

.overlay-content {
  color: white;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  p {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
    line-height: 1.4;
  }
}

// Animation d'apparition
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive optimisé pour 6 colonnes
@media (min-width: 1400px) {
  .masonry-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .masonry-container {
    padding: 1rem 0.5rem;
  }

  .overlay {
    padding: 1rem;
  }

  .overlay-content {
    h3 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.85rem;
    }
  }
}

/* Modal Styles */
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
}

.modal-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  z-index: 1001;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  &.modal-prev {
    left: 1rem;
  }

  &.modal-next {
    right: 1rem;
  }
}

.modal-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  max-width: 1200px;
  max-height: 85vh;
  width: 100%;
  margin: 0 auto;
}

.modal-image-container {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 75vh;

  img {
    max-width: 600px;
    max-height: 75vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

.modal-info {
  flex: 0 0 600px;
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  max-height: 75vh;
  overflow-y: auto;

  h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .modal-description {
    margin: 0 0 2rem 0;
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.9;
    flex-grow: 1;
  }

  .modal-counter {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
}

/* Mobile specific modal adjustments */
@media screen and (max-width: 768px) {
  .modal-nav {
    width: 44px;
    height: 44px;
    padding: 0.8rem;
  }

  .modal-close {
    top: 0.5rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }

  .modal-layout {
    flex-direction: column;
    max-height: 95vh;
    gap: 1.5rem;
    max-width: 95%;
  }

  .modal-image-container {
    max-height: 50vh;
    
    img {
      max-height: 50vh;
      max-width: 90vw;
    }
  }

  .modal-info {
    flex: 0 0 auto;
    width: 100%;
    max-height: 40vh;
    padding: 1rem;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .modal-description {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .modal-counter {
      padding-top: 1rem;
    }
  }
}
</style>