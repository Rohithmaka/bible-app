import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Swords, Zap, Flame, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: <Swords size={56} color="#FF4655" className="mb-6" />,
    title: "YOUR RIVAL IS ALREADY TRAINING.",
    description: "ALTER turns your daily goals into a boss fight. Every hour you delay, your rival gets stronger and claims your potential.",
    accentText: "THE CLOCK IS TICKING."
  },
  {
    icon: <Zap size={56} color="#4FC3F7" className="mb-6" />,
    title: "XP BLEEDS IN REAL-TIME.",
    description: "Your rival steadily drains XP from your tasks. Tap DONE early to lock in your XP and stop the bleed. Delaying gives them the win.",
    accentText: "FINISH TASKS EARLY."
  },
  {
    icon: <Flame size={56} color="#FFD700" className="mb-6" />,
    title: "CLEAN DAYS & HOT STREAKS.",
    description: "Complete all daily tasks before 6 PM for a 1.25x Clean Day bonus. Keep a 3+ day streak to cut your rival's bleed power in half.",
    accentText: "EARN THE ADVANTAGE."
  }
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/(onboarding)/rival-create');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView className="flex-1 bg-background justify-between p-6">
      {/* Header Skip */}
      <View className="flex-row justify-end p-2">
        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => router.push('/(onboarding)/rival-create')}>
            <Text className="text-muted font-sans text-sm tracking-wider uppercase">Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Slide Content */}
      <View className="flex-1 items-center justify-center px-4">
        {/* Animated Icon Container */}
        <View className="bg-card/50 border border-border/40 p-8 rounded-full mb-8 shadow-2xl items-center justify-center">
          {slide.icon}
        </View>

        {/* Pixel Title */}
        <Text className="text-rival text-2xl font-pixel text-center leading-9 mb-6 tracking-tight">
          {slide.title}
        </Text>

        {/* Inter Body */}
        <Text className="text-white/80 font-sans text-base text-center leading-6 mb-6">
          {slide.description}
        </Text>

        {/* Subtitle / Focus Callout */}
        <Text className="text-gold font-pixel text-xs text-center tracking-widest mt-2 uppercase">
          {slide.accentText}
        </Text>
      </View>

      {/* Footer controls */}
      <View className="pb-8">
        {/* Indicators */}
        <View className="flex-row justify-center space-x-3 mb-8">
          {SLIDES.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-rival' : 'w-2 bg-muted/30'
              }`}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="bg-rival py-5 rounded-xl flex-row justify-center items-center space-x-2 border-b-4 border-red-800"
        >
          <Text className="text-white font-pixel text-sm tracking-widest uppercase">
            {currentSlide === SLIDES.length - 1 ? "Meet Your Rival" : "Next"}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" className="ml-2" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
