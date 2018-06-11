/*
 * Copyright (c) 2000-2006 Joachim Henke
 *
 * For conditions of distribution and use, see copyright notice in base93.c
 */

#ifndef BASE93_H
#define BASE93_H 1

#include <stddef.h>

struct basE93 {
	unsigned long queue;
	unsigned int nbits;
	int val;
};

void basE93_init(struct basE93 *);

size_t basE93_encode(struct basE93 *, const void *, size_t, void *);

size_t basE93_encode_end(struct basE93 *, void *);

size_t basE93_decode(struct basE93 *, const void *, size_t, void *);

size_t basE93_decode_end(struct basE93 *, void *);

#endif	/* base93.h */
