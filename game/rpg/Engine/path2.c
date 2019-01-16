//#include <stdio.h>
//#include <sys/uio.h>
#include <math.h>
#include <stdlib.h>

#ifdef __EMSCRIPTEN__

#include <emscripten.h>
#define WASM_EXPORT  EMSCRIPTEN_KEEPALIVE

#else
#define WASM_EXPORT  __attribute__((visibility("default")))

#endif
/* External function that is implemented in JavaScript. */
//extern void putc_js(char c);
inline int max(int a, int b)
{
	return  a > b ? a:b;
}
inline int min(int a, int b)
{
	return  a < b ? a:b;
}
typedef struct Node Node;
struct Node
{
	unsigned char x;
	unsigned char y;
	unsigned short nowCost;
	unsigned int block, version;
	//unsigned int dist;
	unsigned char links[4];
	Node* parent;
	Node* next;
	Node* pre;
};
/**
 * A* path finding 256x256 4 direction
 * @author WangTao
 */
//7 8 9
#define D1	8
//128 256 512
#define MAP_SIZE 256
#define MAX_PATH_SIZE	(10*MAP_SIZE)
#define MAX_UNITS_NUMBER	3000
#define MAP_SIZE_1 (MAP_SIZE - 1)

Node  map[MAP_SIZE*MAP_SIZE];
Node* g_startNode=0;
Node* g_endNode=0;
unsigned short offsetLeft=0, offsetTop=0;
unsigned int nodeVersion = 0;
unsigned int mapVersion = 0;
unsigned int maxOperations = MAP_SIZE*24;

unsigned short int_path_data[MAX_PATH_SIZE*2];
int int_path_data_length;
void path_push(unsigned short x,unsigned short y){
	int_path_data[int_path_data_length]=x;
	int_path_data[int_path_data_length+1]=y;
	int_path_data_length+=2;
};
float g_gameUnits[MAX_UNITS_NUMBER*3];
float g_array[20*3];

//Create Map
 void createMap(void)
{
//	path.data = path_data;
	mapVersion++;

	int l;
	int i;
	//int r;
	int x;
	int y;
	Node *n;
	//Node** links;
	unsigned char * links;
	int c;

	if (1)
	{
		l = MAP_SIZE * MAP_SIZE;
		for (i = 0; i < l; i++)
		{
			n = &map[i];
			x = i & MAP_SIZE_1;
			y = i >> D1;
			n->x = x;
			n->y = y;
			if(x<0||y<0){
				y = i >> D1;
			}
			n->block=0;
//			n->linksLength=0;
			n->next=0;
			n->pre=0;
			n->parent=0;
			n->version=0;
		}
	}
	l = MAP_SIZE * MAP_SIZE;
	i = 0;
//	map[1].block = mapVersion;
//	map[3].block = mapVersion;
//	map[MAP_SIZE+2].block = mapVersion;
//	while (i < BLOCK_NUM)
//	{
//		float rd =0;//rand();
//		r = (int)(rd/0x7fff * l);
//		if (map[r].block == mapVersion) continue;
//		map[r].block = mapVersion;
//		i++;
//	}
	for (i = 0; i < l; i++)
	{
		n = &map[i];
		if (n->block == mapVersion) continue;
		links = n->links;
		x = n->x;
		y = n->y;
		c = 0;
		if (((i & MAP_SIZE) >> D1) ^ (i & 1))
		{
			if (y > 0 && map[(y - 1) << D1 | x].block != mapVersion)
			{
				//links[c] = &map[(y - 1) << D1 | x];
				//links[c] =  - MAP_SIZE ;
				links[c] =  3 ;
				c++;
			}
			if (y < MAP_SIZE_1 && map[(y + 1) << D1 | x].block != mapVersion)
			{
				//links[c] = &map[(y + 1) << D1 | x];
				//links[c] =  MAP_SIZE ;
				links[c] =  2 ;
				c++;
			}
			if (x < MAP_SIZE_1 && map[y << D1 | (x + 1)].block != mapVersion)
			{
				//links[c] = &map[y << D1 | (x + 1)];
				links[c] =  1 ;
				links[c] =  0 ;
				c++;
			}
			if (x > 0 && map[y << D1 | (x - 1)].block != mapVersion)
			{
				//links[c] = &map[y << D1 | (x - 1)];
				links[c] =  -1 ;
				links[c] =  1 ;
				c++;
			}
		}
		else
		{
			if (x < MAP_SIZE_1 && map[y << D1 | (x + 1)].block != mapVersion)
			{
				//links[c] = &map[y << D1 | (x + 1)];
				links[c] =  1 ;
				links[c] =  0 ;
				c++;
			}
			if (x > 0 && map[y << D1 | (x - 1)].block != mapVersion)
			{
				//links[c] = &map[y << D1 | (x - 1)];
				links[c] =  -1 ;
				links[c] =  1 ;
				c++;
			}
			if (y > 0 && map[(y - 1) << D1 | x].block != mapVersion)
			{
				//links[c] = &map[(y - 1) << D1 | x];
				//links[c] =  -MAP_SIZE ;
				links[c] =  3 ;
				c++;
			}
			if (y < MAP_SIZE_1 && map[(y + 1) << D1 | x].block != mapVersion)
			{
				//links[c] = &map[(y + 1) << D1 | x];
				//links[c] =  MAP_SIZE ;
				links[c] =  2 ;
				c++;
			}
		}
		if(c<4)links[3] =4;//0;
		if(c<3)links[2] =4;//0;
//		n->linksLength = c;
	}
}

void buildPath(Node *startNode, Node *endNode)
{
	g_startNode=startNode;g_endNode=endNode;
	int count=1;//array_push(&path , endNode);
	Node *next=endNode;
	Node *previous=next->parent;
	if(endNode != startNode){
		endNode = endNode->parent; count++;

		while (endNode != startNode) {
			endNode = endNode->parent;
			previous->parent=next;
			next = previous;
			previous = endNode;
			count++;//array_push(&path , endNode);
		}
		previous->parent=next;
	}
	int_path_data_length=(count>MAX_PATH_SIZE)? MAX_PATH_SIZE: count;
}
void search2(int startX, int startY,int endX,int endY, int distance)
{
	Node* startNode = &map[startY << D1 | startX];
//	Node* endNode = &map[endY << D1 | endX];
	if (startNode->block == mapVersion /*|| endNode->block == mapVersion*/)
	{
		int_path_data_length=0;
		return;
	}
	int i,/*l,*/f;
	Node* t;
	int dx= (endX - startX);int dy= (endY - startY);
	int openBase = abs(endX - startX) + abs(endY - startY);
	Node* open[2];open[0]=0;open[1]=0;
	Node* closestNode = startNode;
	Node* current;
	Node* test;
	open[0] = startNode;
	startNode->next = 0; startNode->pre = 0;
	startNode->version = ++nodeVersion;
	startNode->nowCost = 0;
	int closestNodeDist=dx*dx+dy*dy;//startNode->dist = dx*dx+dy*dy;
	int currentIndex;
	int nOperation=0;
	const short offsets[4]={1, -1, MAP_SIZE, -MAP_SIZE};
	while (nOperation < maxOperations)
	{
		nOperation++;
		current = open[0];
		open[0] = current->next;
		if (open[0]) open[0]->pre = 0;

		int dx= (endX - current->x);int dy= (endY - current->y);
		int currentDist = dx*dx+dy*dy;
		if (currentDist <=distance)//if (current->dist <=distance)
		{
			buildPath(startNode, current);
			return;
		}
		if (currentDist < closestNodeDist){//if (current->dist < closestNode->dist){
			closestNodeDist=currentDist; closestNode=current;
		}
		currentIndex=current->y << D1 | current->x;
		for (i = 0; i < 4; i++)
		{
			const unsigned char cLink=current->links[i];
			if (cLink > 3) break;
			test = &map[currentIndex+ offsets[cLink]];
			if (test->block == mapVersion) continue;
			f = current->nowCost + 1;
			if (test->version != nodeVersion)
			{
				test->version = nodeVersion;
				test->parent = current;
				test->nowCost = f;
				int dx= (endX - test->x);int dy= (endY - test->y);
//				test->dist = dx*dx+dy*dy;//abs(endX - test->x) + abs(endY - test->y);
				f += (abs(dx) + abs(dy));
				//test->mayCost = f;
				f = (f - openBase) >> 1;
				test->pre = 0;
				test->next = open[f];
				if (open[f]) open[f]->pre = test;
				open[f] = test;
			}
			else if (test->nowCost > f)
			{
				Node* pre=test->pre;Node* next=test->next;
				if (pre) pre->next = next;
				if (next) next->pre = pre;
				//if (test->pre) test->pre->next = test->next;
				//if (test->next) test->next->pre = test->pre;
				if (open[1] == test) open[1] = next;//test->next;
				test->parent = current;
				test->nowCost = f;
				//test->mayCost = f + test->dist;
				test->pre = 0;
				test->next = open[0];
				if (open[0]) open[0]->pre = test;
				open[0] = test;
			}

		}
		if (!open[0])
		{
			if (!open[1]) break;
			t = open[0];
			open[0] = open[1];
			open[1] = t;
			openBase += 2;
		}
	}
	int_path_data_length=0;//path.length=0;
	buildPath(startNode, closestNode);
}
inline int isWalkableAt(int x,int y){
	return map[y  << D1 | x].block != mapVersion;
}
int searchBirthLocation(int startX, int startY,int* loc) {
	Node* startNode = &map[(startY-offsetTop) << D1 | (startX-offsetLeft)];
	if (startNode->block != mapVersion)
	{
		loc[0]=startX;loc[1]=startY;
		return 1;
	}
	int i = 1; int x0,  y0,x1,  y1,x,y, found=0;
	while (i<128) {
		x0 = startX-i -offsetLeft; y0 = startY-i -offsetTop;
		x1 = startX+i -offsetLeft; y1 = startY+i -offsetTop;
		i++;
		if(x0>MAP_SIZE_1|| y0>MAP_SIZE_1) continue;
		if(x0<0) x0=0;
		if(x1>MAP_SIZE_1) x1=MAP_SIZE_1;
		if(y0<0) y0=0;
		if(y1>MAP_SIZE_1) y1=MAP_SIZE_1;
		for (x= x0; x <=x1;x++) {
			y=y0;
			if(isWalkableAt(x,y)) {found=1;break;}
			y=y1;
			if(isWalkableAt(x,y)){found=1;break;}
		}
		if(found)break;
		for (y= y0; y <=y1;y++) {
			x=x0;
			if(isWalkableAt(x,y)) {found=1;break;}
			x=x1;
			if(isWalkableAt(x,y)) {found=1;break;}
		}
		if(found)break;
	}
	loc[0]=(x+offsetLeft);loc[1]=(y+offsetTop);
	return found;
}
WASM_EXPORT void* getPath(){
	int_path_data[1]=33;
	return int_path_data;
}
WASM_EXPORT void* getObjects(){
	return g_gameUnits;
}
WASM_EXPORT void* getArray(){
	return g_array;
}
int init(int unitsLength,double agentRadius,int posX, int posY, const int fill){
	mapVersion++;
	int j, blocked=0;float selfRadius=(float)agentRadius;
	for (j=0; j<unitsLength;j++) {
		int i = j*3;
		float radius=g_gameUnits[i+2];
		float m_vPosX = g_gameUnits[i], m_vPosY = g_gameUnits[i+1];
		int centerX=(int)(m_vPosX), centerY=(int)(m_vPosY);
//		int startX =centerX- expand +1, startY = centerY-expand +1;
//		int toIntX =centerX+ expand -1, toIntY = centerY+expand -1;
		int expand0=(int)(radius) + (int)(selfRadius+.5f),
			expand1=(int)(radius+.5f) + (int)(selfRadius);
		int startX = centerX-expand0 +1, toIntX = centerX+expand1 -1;

		int startY = centerY-expand0 +1, toIntY = centerY+expand1 -1;

		if (startX<=posX&&posX<=toIntX&&startY<=posY&&posY<=toIntY)blocked=1;

		startX -= offsetLeft;startY -= offsetTop;
		toIntX -= offsetLeft;toIntY -= offsetTop;
		if(startX>MAP_SIZE_1|| startY>MAP_SIZE_1|| toIntX<0|| toIntY<0) continue;
		if(startX<0) startX=0;
		if(toIntX>MAP_SIZE_1) toIntX=MAP_SIZE_1;
		if(startY<0) startY=0;
		if(toIntY>MAP_SIZE_1) toIntY=MAP_SIZE_1;
		int x, y;
		if(fill){
			for (x= startX; x <=toIntX;x++) {
				for (y= startY; y <=toIntY;y++)
					map[y  << D1 | x].block = mapVersion;
			}
		} else{
			for (x= startX; x <=toIntX;x++) {
				map[startY  << D1 | x].block = mapVersion;
				map[toIntY  << D1 | x].block = mapVersion;
			}
			for (y= startY; y <=toIntY;y++) {
				map[y  << D1 | startX].block = mapVersion;
				map[y  << D1 | toIntX].block = mapVersion;
			}
		}
	}
	return blocked;
}
void smoothenPath(double m_startX,double m_startY) {
	int len = int_path_data_length;
	int_path_data_length = 0;
	if (len <= 1) return;
	double sx, sy,	// current start coordinate
		   ex, ey;	// current end coordinate
	int i, blocked;
	Node* previous=g_startNode->parent;
	Node* coord= previous->parent;
	sx = m_startX;
	sy = m_startY;
	path_push( (unsigned short)sx, (unsigned short)sy);
	for (i = 2; i < len; i++, previous = coord, coord = coord->parent) {//2 ,++
//		coord = path.data[i];
		ex = coord->x+offsetLeft;
		ey = coord->y+offsetTop;
		blocked = 0;
		double x0=sx,y0=sy, xEnd=ex+.5,yEnd=ey+.5;
		double dx = xEnd - x0;                             //x increment
		double dy = yEnd - y0;                             //y increment
		double steps, steps_start,steps_by_x=1,iSteps;
		double xIncrement, yIncrement, x = x0, y = y0;
		if (fabs(dx) > fabs(dy)) {
			steps =iSteps= fabs(dx);
			steps_start=x0;

			if(x0<xEnd){
				steps_start=((int)steps_start+1);
				iSteps= (int)(xEnd) - steps_start;
				if(x0==(int)(x0)) {
					iSteps++;
					steps_start--;
				}
			}else if(x0>xEnd){
				steps_start= (int)(steps_start);
				iSteps= (int)(steps_start) - ((int)xEnd + 1);
			}
//			steps_start=x0;
//			if(x0<xEnd) steps_start=(int)(steps_start+1)- steps_start;
//			else if(x0>xEnd){
//				steps_start= steps_start-(int)(steps_start);
//				if(xEnd!=(int)(xEnd)) iSteps++;
//			}
		} else {
			steps =iSteps= fabs(dy);
			steps_by_x=0;

			steps_start=y0;
			if(y0<yEnd) {
				steps_start=((int)steps_start+1);
				iSteps= (int)(yEnd) - steps_start;
				if(y0==(int)(y0)) {
					iSteps++;
					steps_start--;
				}
			}else if(y0>yEnd) {
				steps_start= (int)(steps_start);
				iSteps= steps_start - ((int)yEnd+1);
			}
//			steps_start=y0;
//			if(y0<yEnd) steps_start=(int)(steps_start+1)- steps_start;
//			else if(y0>yEnd) {
//				steps_start= steps_start-(int)(steps_start);
//				if(yEnd!=((int)yEnd)) iSteps++;
//			}
		}
		xIncrement = (dx) / (steps);          //x increment
		yIncrement = (dy) / (steps);          //y increment
		double lastX=(x0),lastY=(y0);
		int iLastX=(int)lastX, iLastY=(int)lastY;
		double k;
		double tmp1 = steps_by_x? xIncrement: yIncrement;
		double i0=0;
		for( k = steps_start;i0 <= (iSteps); k+= tmp1, i0++ )//k <= (iSteps);
		{
//			x = x0 + xIncrement * k;
//			y = y0 + yIncrement * k;
			if (steps_by_x){
				x = (int)k;
				double r = fabs(x - x0);
				y = y0 + yIncrement * r;
			} else{
				y = (int)k;
				double r = fabs(y - y0);
				x = x0 + xIncrement * r;
			}
			int ix=(int)(x),iy=(int)(y);
			int dir = (ix-iLastX )* ( iy-iLastY);
			if(steps_by_x) {
				if((dir>0&& !isWalkableAt(min(iLastX,ix)-offsetLeft,max(iLastY,iy)-offsetTop))
				||(dir<0&& !isWalkableAt(min(iLastX,ix)-offsetLeft,min(iLastY,iy)-offsetTop))) {blocked = 1; break;}
			} else {
				if((dir>0&& !isWalkableAt(max(iLastX,ix)-offsetLeft,min(iLastY,iy)-offsetTop))
				||(dir<0&& !isWalkableAt(min(iLastX,ix)-offsetLeft,min(iLastY,iy)-offsetTop))) {blocked = 1; break;}
			}
			lastX=x;lastY=y;
			iLastX=ix; iLastY=iy;
			if(!isWalkableAt(ix-offsetLeft,iy-offsetTop)) {blocked = 1; break;}
		}
		if (blocked) {
			Node*lastValidCoord = previous;//path.data[i - 1];
			unsigned short ix=lastValidCoord->x+offsetLeft, iy=lastValidCoord->y+offsetTop;
			path_push(ix, iy);
			sx = (ix)+.5;
			sy = (iy)+.5;
		}
	}
	int x1 = previous->x, y1 = previous->y; // path end
	path_push(x1+offsetLeft, y1+offsetTop);
}
WASM_EXPORT int birthLocation(int unitsLength,double agentRadius,double dStartX,double dStartYd){
	int startX=(int)dStartX,  startY=(int)dStartYd;
	init(unitsLength,agentRadius,startX,startY,1);
	int loc[2];
	int found =searchBirthLocation( startX,  startY, loc);
	int_path_data[0]=loc[0]; int_path_data[1]=loc[1];
	if(!found) return 0;
	return -1;
}
WASM_EXPORT int findPath(int unitsLength,double agentRadius,double dStartX,double dStartYd, double dEndXd,double dEndYd){
	int startX=(int)dStartX,  startY=(int)dStartYd, endX=(int)dEndXd, endY=(int)dEndYd;

	int left = startX-MAP_SIZE/2, top=startY-MAP_SIZE/2;
	if(left<0)left=0; if(top<0)top=0;
	offsetLeft=(unsigned short)left; offsetTop=(unsigned short)top;

	int blocked =init(unitsLength,agentRadius,startX,startY, 0);
	if(blocked) return birthLocation(unitsLength, agentRadius, dStartX, dStartYd);
	search2( startX-offsetLeft,  startY-offsetTop, endX-offsetLeft, endY-offsetTop,0);
	smoothenPath(dStartX,dStartYd);
	return int_path_data_length;
}
WASM_EXPORT int findPathAttack(int unitsLength,double agentRadius,double dStartX,double dStartYd, int count, double attackRadius){
//	unitsLength=33;agentRadius=2.5;
//	dStartX=276.4537949034762;dStartYd=218.41906158745186;count=1;attackRadius=6.55;
//	g_gameUnits[0]=200;g_gameUnits[1]=200;g_gameUnits[2]=5;g_gameUnits[3]=320;g_gameUnits[4]=200;g_gameUnits[5]=5;g_gameUnits[6]=260;g_gameUnits[7]=240;g_gameUnits[8]=5;g_gameUnits[9]=383.6649475097656;g_gameUnits[10]=229.52749633789062;g_gameUnits[11]=1.5;g_gameUnits[12]=248.3737030029297;g_gameUnits[13]=234.36410522460938;g_gameUnits[14]=2.5;g_gameUnits[15]=252.02499389648438;g_gameUnits[16]=229.5;g_gameUnits[17]=2.5;g_gameUnits[18]=186.40371704101562;g_gameUnits[19]=290.64459228515625;g_gameUnits[20]=2.5;g_gameUnits[21]=273.9791259765625;g_gameUnits[22]=237.9715118408203;g_gameUnits[23]=2.5;g_gameUnits[24]=247.02113342285156;g_gameUnits[25]=241.29400634765625;g_gameUnits[26]=2.5;g_gameUnits[27]=261.1516418457031;g_gameUnits[28]=227.1516571044922;g_gameUnits[29]=2.5;g_gameUnits[30]=191.125;g_gameUnits[31]=288.2713317871094;g_gameUnits[32]=2.5;g_gameUnits[33]=269.5;g_gameUnits[34]=250.89999389648438;g_gameUnits[35]=2.5;g_gameUnits[36]=264.3625183105469;g_gameUnits[37]=250.02285766601562;g_gameUnits[38]=2.5;g_gameUnits[39]=266.5;g_gameUnits[40]=228.02499389648438;g_gameUnits[41]=2.5;g_gameUnits[42]=273.92498779296875;g_gameUnits[43]=242.5;g_gameUnits[44]=2.5;g_gameUnits[45]=254.9450225830078;g_gameUnits[46]=252.84432983398438;g_gameUnits[47]=2.5;g_gameUnits[48]=259.5;g_gameUnits[49]=253.97500610351562;g_gameUnits[50]=2.5;g_gameUnits[51]=249.3218994140625;g_gameUnits[52]=248.31507873535156;g_gameUnits[53]=2.5;g_gameUnits[54]=383.68963623046875;g_gameUnits[55]=237.53160095214844;g_gameUnits[56]=2;g_gameUnits[57]=383.68963623046875;g_gameUnits[58]=245.53160095214844;g_gameUnits[59]=2;g_gameUnits[60]=383.82501220703125;g_gameUnits[61]=253.5;g_gameUnits[62]=2;g_gameUnits[63]=391.6140441894531;g_gameUnits[64]=229.50814819335938;g_gameUnits[65]=2;g_gameUnits[66]=391.5641784667969;g_gameUnits[67]=237.50457763671875;g_gameUnits[68]=2;g_gameUnits[69]=391.5641784667969;g_gameUnits[70]=245.50457763671875;g_gameUnits[71]=2;g_gameUnits[72]=391.8500061035156;g_gameUnits[73]=253.5;g_gameUnits[74]=2;g_gameUnits[75]=399.57720947265625;g_gameUnits[76]=229.50350952148438;g_gameUnits[77]=2;g_gameUnits[78]=399.57720947265625;g_gameUnits[79]=237.50350952148438;g_gameUnits[80]=2;g_gameUnits[81]=399.57720947265625;g_gameUnits[82]=245.50350952148438;g_gameUnits[83]=2;g_gameUnits[84]=399.8500061035156;g_gameUnits[85]=253.5;g_gameUnits[86]=2;g_gameUnits[87]=407.6084899902344;g_gameUnits[88]=229.5165252685547;g_gameUnits[89]=2;g_gameUnits[90]=407.91888427734375;g_gameUnits[91]=237.56297302246094;g_gameUnits[92]=2;g_gameUnits[93]=407.6761474609375;g_gameUnits[94]=245.5262451171875;g_gameUnits[95]=2;g_gameUnits[96]=407.78240966796875;g_gameUnits[97]=253.54161071777344;g_gameUnits[98]=2;
//	g_array[0]=260;g_array[1]=240;g_array[2]=5;


	int startX=(int)dStartX,  startY=(int)dStartYd;
	count = count>16?16:count;
	int left = startX-MAP_SIZE/2, top=startY-MAP_SIZE/2;
	if(left<0)left=0; if(top<0)top=0;
	offsetLeft=(unsigned short)left; offsetTop=(unsigned short)top;

	int blocked =init(unitsLength,agentRadius,startX,startY, 0);
	if(blocked) return birthLocation(unitsLength, agentRadius, dStartX, dStartYd);
	unsigned int tmp =maxOperations;
	maxOperations=256*4; int i=0;
	for (i=0;i<count;i++){
		int endX=(int)(g_array[i*3]), endY=(int)(g_array[i*3+1]);
		float f0=g_array[i*3+2];
		double radius=f0*1.42;
		int distance = (int)((attackRadius+radius)*(attackRadius+radius));
		search2( startX-offsetLeft,  startY-offsetTop, (int)endX-offsetLeft, (int)endY-offsetTop, distance);
		if(int_path_data_length>0){
			int pathEndX=g_endNode->x+offsetLeft; int pathEndY=g_endNode->y+offsetTop;
			int dx = (pathEndX-endX),dy=(pathEndY-endY);
			if(dx*dx+dy*dy <= (attackRadius+radius)*(attackRadius+radius)){
				maxOperations=tmp;
				g_array[0]=i;
				smoothenPath(dStartX,dStartYd);
				return int_path_data_length;
			}
		}
	}
	maxOperations=tmp;
	return -2;
}
WASM_EXPORT int main(void){
	createMap();
	//findPathAttack(0,0,0,0,0,0);
//	long  frameTime = clock();
//	int i=0;
//	double startX=0, startY=10,endX=138, endY=244;
//	findPath(5,8, startX,  startY, endX, endY);
//	search( startX,  startY, endX, endY);
//	frameTime =  (clock()-frameTime);
//	printf("frameTime--%d\n",frameTime);
//	for( i=0;i<path.length;i++){
//		printf("%d--%d\n",path.data[i]->x, path.data[i]->y);
//	}
	return MAP_SIZE;
}
