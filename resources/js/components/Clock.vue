<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';
import { useIntervalFn, useNow } from '@vueuse/core';
import Alarm from '@/components/icons/Alarm.vue';
import Person from '@/components/icons/Person.vue';
import FaceHappy from '@/components/icons/FaceHappy.vue';
import FaceSad from '@/components/icons/FaceSad.vue';
import Logo from '@/assets/images/logo-goldenbee.png';

// State
const video = ref(null);
const detectedFace = ref(false);
const presentDurations = ref([]);
const absentDurations = ref([]);
let currentStart = ref(null);
let interval = null;
let detector = null;
let isLogin = ref(true);

// Thời gian hiện tại
const now = useNow();

// Load TensorFlow.js model
const loadModel = async () => {
  detector = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
    runtime: 'tfjs',
    maxFaces: 1,
  });
};

// Phát hiện khuôn mặt
const detectFace = async () => {
  if (!detector || !video.value) return;

  const faces = await detector.estimateFaces(video.value);
  const faceDetected = faces.length > 0;

  if (faceDetected !== detectedFace.value) {
    const end = now.value;

    if (detectedFace.value) {
      presentDurations.value.push({ start: currentStart.value, end });
    } else {
      absentDurations.value.push({ start: currentStart.value, end });
    }

    currentStart.value = end;
  }

  detectedFace.value = faceDetected;
};

// Bắt đầu phát hiện khuôn mặt
const startFaceDetection = () => {
  interval = useIntervalFn(async () => {
    await detectFace();
  }, 500);
};

// Setup webcam
const setupWebcam = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.value.srcObject = stream;
};

// Tổng thời gian
const totalPresentTime = computed(() =>
  presentDurations.value.reduce((sum, period) => sum + (new Date(period.end) - new Date(period.start)) / 1000, 0)
);
const totalAbsentTime = computed(() =>
  absentDurations.value.reduce((sum, period) => sum + (new Date(period.end) - new Date(period.start)) / 1000, 0)
);

// Kết hợp tất cả thời gian (cho timeline)
const allDurations = computed(() =>
  [...presentDurations.value.map(d => ({ ...d, type: 'present' })),
  ...absentDurations.value.map(d => ({ ...d, type: 'absent' }))]
    .sort((a, b) => new Date(a.start) - new Date(b.start))
);

onMounted(async () => {
  currentStart.value = now.value;
  await setupWebcam();
  await loadModel();
  startFaceDetection();
});

onBeforeUnmount(() => {
  interval.stop();
});
</script>

<template>
  <div class="pt-5 min-h-screen bg-white">
    <div class="flex justify-between items-center p-2 px-4 sm:px-6 md:px-8 bg-white shadow">
      <div class="text-sm sm:text-base md:text-lg font-medium text-gray-950 pl-1 md:pl-16">
        Trạng thái nhận diện
      </div>
      <div v-if="isLogin" class="flex items-center space-x-2 sm:space-x-4 pr-1  md:pr-16">
        <div class="text-xs sm:text-sm md:text-base font-medium text-gray-950">
          Phúc Rờm
        </div>
        <div class="bg-blue-500 w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
          <span class="text-white text-[10px] sm:text-xs md:text-sm">
            PK
          </span>
        </div>
      </div>
      <div v-else="isLogin" class="flex items-center space-x-2 sm:space-x-4 pr-4 sm:pr-6 md:pr-16 cursor-pointer">
        <a href="/login" class="text-sm sm:text-base md:text-lg font-medium text-gray-950 hover:text-orange-700">
          Sign in
        </a>
      </div>
    </div>


    <!-- Tổng thời gian -->
    <div
      class="flex flex-col sm:flex-row sm:justify-start mt-7 max-w-[90%] lg:max-w-[80%] mx-auto items-start text-gray-950 space-y-4 sm:space-y-0 sm:space-x-12">
      <p>
        Tổng thời gian <span class="font-semibold text-green-600">có mặt:</span>
        {{ totalPresentTime }} giây
      </p>
      <p class="truncate">
        Tổng thời gian <span class="font-semibold text-red-600">vắng mặt:</span>
        {{ totalAbsentTime }} giây
      </p>

    </div>

    <div class="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-4 mt-4 max-w-[90%] lg:max-w-[80%] mx-auto">
      <div
        class="relative w-full lg:w-8/12 max-h-[400px] sm:max-h-[500px] bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
        <div class="relative w-full max-h-[400px] sm:max-h-[500px] rounded-lg overflow-hidden">
          <video ref="video" autoplay muted playsinline class="w-full h-full object-cover"></video>
          <div :class="detectedFace ? 'bg-green-500' : 'bg-red-500'"
            class="absolute top-4 left-4 w-6 h-6 rounded-full shadow-lg" title="Trạng thái phát hiện">
            <template v-if="detectedFace">
              <FaceHappy class="text-white" />
            </template>
            <template v-else>
              <FaceSad class="text-white" />
            </template>
          </div>
        </div>
        <Skeleton v-if="detectedFace === null" height="18rem" class="rounded-lg bg-gray-300"></Skeleton>

        <div :class="detectedFace ? 'text-green-500' : 'text-red-500'"
          class="absolute bottom-0 left-0 bg-black bg-opacity-50 text-sm px-4 py-2 rounded-lg flex items-center space-x-1">
          <span>{{ detectedFace ? 'Có mặt' : 'Không có mặt' }}</span>
          <i class="fas fa-signal"></i>
        </div>
      </div>

      <div class="relative w-full lg:w-4/12 min-h-[300px] sm:min-h-[480px] bg-white rounded-lg shadow justify-center">
        <div class="flex justify-between items-center p-2 px-4 sm:px-6 shadow">
          <div class="text-sm sm:text-base font-medium text-gray-950">
            Lịch sử thời gian
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4">
            <div class="text-sm font-medium text-gray-950">Phúc Rờm</div>
            <div class="bg-blue-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
              <span class="text-white text-xs sm:text-sm">PK</span>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <div
            class="relative border-l-4 border-gray-300 pl-6 pt-4 space-y-6 max-h-[280px] sm:max-h-[445px] overflow-y-auto">
            <div v-for="(duration, index) in allDurations" :key="index" class="relative">
              <div class="flex justify-between">
                <p class="text-sm text-gray-700">
                  <span
                    :class="duration.type === 'present' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                    {{ duration.type === 'present' ? 'Có mặt' : 'Vắng mặt' }}
                  </span>
                  từ: <span class="font-medium">{{ duration.start.toLocaleTimeString() }}</span>
                  - đến: <span class="font-medium">{{ duration.end.toLocaleTimeString() }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute top-2 right-2 text-white">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
    </div>
  </div>
</template>
