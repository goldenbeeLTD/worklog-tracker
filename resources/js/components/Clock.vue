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
  <div class="min-h-screen bg-yellow-50">
    <div class="p-5 flex flex-col items-center">
      <div class="w-full max-w-5xl bg-white rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Person /> Trạng thái nhận diện
          </h2>
          <!-- Video stream và trạng thái phát hiện -->
          <div class="relative w-full h-72 bg-yellow-500 rounded-lg overflow-hidden">
            <video ref="video" autoplay muted playsinline class="w-full h-full object-cover"></video>
            <!-- Vòng trạng thái -->
            <div
              :class="detectedFace ? 'bg-green-500' : 'bg-red-500'"
              class="absolute top-4 left-4 w-5 h-5 rounded-full shadow"
              title="Trạng thái phát hiện"
            >
              <template v-if="detectedFace">
                <FaceHappy class="text-white" />
              </template>
              <template v-else>
                <FaceSad class="text-white" />
              </template>
            </div>
          </div>
          <!-- Thông báo Skeleton loading -->
          <Skeleton v-if="detectedFace === null" height="18rem" class="rounded-lg overflow-hidden"></Skeleton>
          <!-- Tổng thời gian -->
          <div class="text-sm space-y-1" v-else>
            <p>
              Tổng thời gian <span class="font-semibold text-green-600">có mặt:</span>
              {{ totalPresentTime }} giây
            </p>
            <p>
              Tổng thời gian <span class="font-semibold text-red-600">vắng mặt:</span>
              {{ totalAbsentTime }} giây
            </p>
          </div>
        </div>
        <!-- Lịch sử thời gian -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Alarm /> Lịch sử thời gian
          </h2>
          <div class="relative border-l-4 border-gray-300 pl-6 space-y-6 max-h-[500px] overflow-y-auto">
            <div v-for="(duration, index) in allDurations" :key="index" class="relative">
              <div>
                <p class="text-sm text-gray-600">
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
      </div>
    </div>
  </div>
</template>
