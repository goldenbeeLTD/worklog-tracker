<template>
  <div class="min-h-screen">
    <div class="p-5 formLogin">

      <div class="max-w-[540px] rounded-md mx-auto shadow p-10">
        <h1 class="text-center text-gray-800 font-bold py-3 text-2xl">Login</h1>
        <a-alert v-if="success" class="select-none mb-4" message="Logged in successfully" type="success" show-icon />
        <a-alert v-if="failure" class="select-none mb-4" message="Login failed (or account has not been authenticated)"
          type="error" show-icon />

        <a-form layout="vertical" ref="formRef" name="custom-validation" :model="formState" :rules="rules"
          v-bind="layout" @finish="handleFinish" @validate="handleValidate" @finishFailed="handleFinishFailed">
          <a-form-item has-feedback label="Email" name="email">
            <a-input v-model:value="formState.email" class="p-2" type="text" autocomplete="off"
              placeholder="example@gmail.com" />
          </a-form-item>

          <a-form-item has-feedback label="Password" name="pass">
            <a-input-password v-model:value="formState.pass" class="p-2" type="password" autocomplete="off"
              placeholder="********" />
          </a-form-item>

          <div class="flex items-start justify-between">
            <a-form-item name="remember" :wrapper-col="{ offset: 0, span: 24 }">
              <a-checkbox v-model:checked="formState.remember">
                <span class="text-base">Remember</span>
              </a-checkbox>
            </a-form-item>
            <NuxtLink to="/forgotPassword" class="text-sm mt-1 font-normal hover:text-red-500">
              <span class="text-base">Forgot password</span>
            </NuxtLink>
          </div>

          <a-form-item :wrapper-col="{ span: 24, offset: 0 }">
            <button :disabled="load" class="bg-yellow-500 hover:bg-yellow-400 font-bold py-3 w-full p-3 rounded-md justify-center mt-2"
              type="submit" aria-label="Nút đăng nhập">
              <span v-if="!load" class="font-normal text-base">
                Login
              </span>
              <span v-else class="font-normal text-base flex gap-2 items-end">
                Logging in
                <IconsTadpole class="mb-[2px]" />
              </span>
            </button>

          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';

const load = ref<boolean>(false);
const success = ref<boolean>(false);
const failure = ref<boolean>(false);

interface FormState {
  email: string;
  pass: string;
  remember: boolean;
}

const formRef = ref();
const formState = reactive<FormState>({
  email: '',
  pass: '',
  remember: true,
});

const validatePass = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('Please enter password');
  } else if (value.length < 8) {
    return Promise.reject('Password must contain at least 8 characters');
  } else if (!/[a-z]/.test(value)) {
    return Promise.reject('Password must contain at least one lowercase letter');
  } else if (!/[A-Z]/.test(value)) {
    return Promise.reject('Password must contain at least one uppercase letter');
  } else if (!/[^A-Za-z0-9]/.test(value)) {
    return Promise.reject('Password must contain at least one special character');
  } else {
    if (formState.checkPass !== '') {
      formRef.value.validateFields('checkPass');
    }
    return Promise.resolve();
  }
};

const validateEmail = async (_rule: Rule, value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === '') {
    return Promise.reject('Please enter email');
  } else if (!emailRegex.test(value)) {
    return Promise.reject('Invalid email');
  } else {
    return Promise.resolve();
  }
};

const rules: Record<string, Rule[]> = {
  email: [{ required: true, validator: validateEmail, trigger: 'change' }],
  pass: [{ required: true, validator: validatePass, trigger: 'change' }],
};

const layout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};

const handleFinish = async (values: FormState) => {
  setTimeout(() => {
    success.value = false;
  }, 1000);
};

const handleValidate = () => { };
const handleFinishFailed = () => { };
</script>

<style scoped>
.formLogin {
  font-family: Arial, sans-serif !important;
}
</style>
