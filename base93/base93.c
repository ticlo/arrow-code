/*
 * basE93 encoding/decoding routines
 *
 * Copyright (c) 2000-2006 Joachim Henke
 * Modified 2018 Rick Zhou
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  - Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  - Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *  - Neither the name of Joachim Henke nor the names of his contributors may
 *    be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

#include "base93.h"

const unsigned char enctab[93] = {
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
	'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '#', '$',
	'%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=',
	'>', '?', '@', '[', ']', '^', '_', '`', '{', '|', '}', '~', ' '
};
const unsigned char dectab[256] = {
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	92, 62, 93, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,
	52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 76, 77, 78, 79, 80, 81,
	82,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 83, 93, 84, 85, 86,
	87, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
	41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 88, 89, 90, 91, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93,
	93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93, 93
};

void basE93_init(struct basE93 *b)
{
	b->queue = 0;
	b->nbits = 0;
	b->val = -1;
}

size_t basE93_encode(struct basE93 *b, const void *i, size_t len, void *o)
{
	const unsigned char *ib = i;
	unsigned char *ob = o;
	size_t n = 0;

	while (len--) {
		b->queue |= *ib++ << b->nbits;
		b->nbits += 8;
		if (b->nbits > 13) {	/* enough bits in queue */
			unsigned int val = b->queue & 0x1FFF;

			if (val > 456) {
				b->queue >>= 13;
				b->nbits -= 13;
			} else {	/* we can take 14 bits */
				val = b->queue & 0x3FFF;
				b->queue >>= 14;
				b->nbits -= 14;
			}
			ob[n++] = enctab[val % 93];
			ob[n++] = enctab[val / 93];
		}
	}

	return n;
}

/* process remaining bits from bit queue; write up to 2 bytes */

size_t basE93_encode_end(struct basE93 *b, void *o)
{
	unsigned char *ob = o;
	size_t n = 0;

	if (b->nbits) {
		ob[n++] = enctab[b->queue % 93];
		if (b->nbits > 7 || b->queue > 92)
			ob[n++] = enctab[b->queue / 93];
	}
	b->queue = 0;
	b->nbits = 0;
	b->val = -1;

	return n;
}

size_t basE93_decode(struct basE93 *b, const void *i, size_t len, void *o)
{
	const unsigned char *ib = i;
	unsigned char *ob = o;
	size_t n = 0;
	unsigned int d;

	while (len--) {
		d = dectab[*ib++];
		if (d == 93)
			continue;	/* ignore non-alphabet chars */
		if (b->val == -1)
			b->val = d;	/* start next value */
		else {
			b->val += d * 93;
			b->queue |= b->val << b->nbits;
			b->nbits += (b->val & 0x1FFF) > 456 ? 13 : 14;
			do {
				ob[n++] = b->queue;
				b->queue >>= 8;
				b->nbits -= 8;
			} while (b->nbits > 7);
			b->val = -1;	/* mark value complete */
		}
	}

	return n;
}

/* process remaining bits; write at most 1 byte */

size_t basE93_decode_end(struct basE93 *b, void *o)
{
	unsigned char *ob = o;
	size_t n = 0;

	if (b->val != -1)
		ob[n++] = b->queue | b->val << b->nbits;
	b->queue = 0;
	b->nbits = 0;
	b->val = -1;

	return n;
}
