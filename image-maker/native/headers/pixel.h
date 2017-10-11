#ifndef PIXEL_H
#define PIXEL_H

    class Pixel {
        char red, green, blue, alpha;

        public:
            void set(char, char, char, char);
            char* get();
            int* getHSV();
            void setHSV(int, int, int);
            char getBW();
    };

#endif
